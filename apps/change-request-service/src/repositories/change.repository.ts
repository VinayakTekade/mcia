import { prisma } from '../lib/prisma';
import { Prisma, ChangeRequest } from '@prisma/client';

export class ChangeRepository {
  async create(data: Prisma.ChangeRequestCreateInput): Promise<ChangeRequest> {
    return prisma.changeRequest.create({ data, include: { comments: true } });
  }

  async findById(id: string): Promise<ChangeRequest | null> {
    return prisma.changeRequest.findUnique({
      where: { id },
      include: { comments: true }
    });
  }

  async findAll(): Promise<ChangeRequest[]> {
    return prisma.changeRequest.findMany({
      include: { comments: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateStatus(id: string, status: any): Promise<ChangeRequest> {
    return prisma.changeRequest.update({
      where: { id },
      data: { status },
      include: { comments: true }
    });
  }

  async addComment(changeRequestId: string, authorId: string, content: string) {
    return prisma.reviewComment.create({
      data: { changeRequestId, authorId, content }
    });
  }
}
