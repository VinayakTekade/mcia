import { ChangeRepository } from '../repositories/change.repository';
import { publishEvent } from '../lib/rabbitmq';

export class ChangeService {
  private repo = new ChangeRepository();

  async createDraft(data: any, authorId: string, authorRole: string) {
    if (authorRole !== 'DEVELOPER' && authorRole !== 'ADMIN') {
      throw { status: 403, message: 'Only developers can create change requests' };
    }

    const cr = await this.repo.create({
      title: data.title,
      description: data.description,
      targetServiceId: data.targetServiceId,
      changeType: data.changeType,
      authorId,
      status: 'DRAFT'
    });

    publishEvent('change.draft_created', cr);
    return cr;
  }

  async submitForReview(id: string, authorId: string, authorRole: string) {
    const cr = await this.repo.findById(id);
    if (!cr) throw { status: 404, message: 'Not found' };
    
    if (cr.authorId !== authorId && authorRole !== 'ADMIN') {
      throw { status: 403, message: 'You can only submit your own drafts' };
    }
    if (cr.status !== 'DRAFT' && cr.status !== 'NEEDS_REVISION') {
      throw { status: 400, message: 'Only DRAFT or NEEDS_REVISION can be submitted' };
    }

    const updated = await this.repo.updateStatus(id, 'SUBMITTED');
    
    // Emit event to Impact Analysis Service and Notification Service
    publishEvent('change.submitted', updated);

    return updated;
  }

  async review(id: string, reviewerId: string, reviewerRole: string, reviewData: any) {
    const { action, comment } = reviewData;
    
    if (!['ARCHITECT', 'RELEASE_MANAGER', 'ADMIN'].includes(reviewerRole)) {
      throw { status: 403, message: 'You do not have permission to review' };
    }

    const cr = await this.repo.findById(id);
    if (!cr) throw { status: 404, message: 'Not found' };
    if (cr.status !== 'SUBMITTED' && cr.status !== 'UNDER_REVIEW') {
      throw { status: 400, message: 'Request is not pending review' };
    }

    await this.repo.addComment(id, reviewerId, comment);

    let newStatus: any = cr.status;
    if (action === 'APPROVE') newStatus = 'APPROVED';
    else if (action === 'REJECT') newStatus = 'REJECTED';
    else if (action === 'NEEDS_REVISION') newStatus = 'NEEDS_REVISION';

    const updated = await this.repo.updateStatus(id, newStatus);
    
    publishEvent(`change.${newStatus.toLowerCase()}`, updated);
    return updated;
  }

  async getAll(userRole: string, userId: string) {
    // Basic rule: Admins see all, others might only see what they authored or need to review.
    // For MVP, returning all, but highlighting the rule checks.
    return this.repo.findAll();
  }

  async getById(id: string) {
    const cr = await this.repo.findById(id);
    if (!cr) throw { status: 404, message: 'Not found' };
    return cr;
  }
}
