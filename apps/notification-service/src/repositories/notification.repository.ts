import { prisma } from '../lib/prisma';

export class NotificationRepository {
  async create(data: {
    userId: string;
    type: any;
    title: string;
    body: string;
    resourceId?: string;
  }) {
    return prisma.notification.create({ data });
  }

  async findByUser(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  }

  async markAsUnread(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: false }
    });
  }

  async findById(id: string) {
    return prisma.notification.findUnique({ where: { id } });
  }
}
