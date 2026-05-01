import { NotificationRepository } from '../repositories/notification.repository';

export class NotificationService {
  private repo = new NotificationRepository();

  async getForUser(userId: string) {
    return this.repo.findByUser(userId);
  }

  async markRead(id: string) {
    const notification = await this.repo.findById(id);
    if (!notification) throw { status: 404, message: 'Notification not found' };
    return this.repo.markAsRead(id);
  }

  async markUnread(id: string) {
    const notification = await this.repo.findById(id);
    if (!notification) throw { status: 404, message: 'Notification not found' };
    return this.repo.markAsUnread(id);
  }
}
