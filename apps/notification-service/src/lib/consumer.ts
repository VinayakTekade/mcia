import amqp from 'amqplib';
import { prisma } from './prisma';
import { NotificationType } from '@prisma/client';

// Map RabbitMQ routing keys to notification types and messages
const eventMap: Record<string, { type: NotificationType; title: string; getBody: (data: any) => string }> = {
  'change.submitted': {
    type: NotificationType.CHANGE_SUBMITTED,
    title: 'Change Request Submitted',
    getBody: (d) => `Change request "${d.title || d.id}" for service "${d.targetServiceId}" has been submitted.`,
  },
  'change.impact_generated': {
    type: NotificationType.IMPACT_REPORT_GENERATED,
    title: 'Impact Report Ready',
    getBody: (d) => `Impact report for change request ${d.changeRequestId} is ready. Risk level: ${d.riskLevel}.`,
  },
  'change.under_review': {
    type: NotificationType.REVIEW_REQUESTED,
    title: 'Review Requested',
    getBody: (d) => `Change request "${d.title || d.id}" has been assigned for review.`,
  },
  'change.approved': {
    type: NotificationType.CHANGE_APPROVED,
    title: 'Change Request Approved',
    getBody: (d) => `Your change request "${d.title || d.id}" has been approved.`,
  },
  'change.rejected': {
    type: NotificationType.CHANGE_REJECTED,
    title: 'Change Request Rejected',
    getBody: (d) => `Your change request "${d.title || d.id}" has been rejected.`,
  },
  'change.needs_revision': {
    type: NotificationType.REVIEW_REQUESTED,
    title: 'Revision Requested',
    getBody: (d) => `Your change request "${d.title || d.id}" has been sent back for revision.`,
  },
};

export const startConsumer = async () => {
  const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

  try {
    const conn = await amqp.connect(rabbitmqUrl);
    const channel = await conn.createChannel();

    await channel.assertExchange('mcia_events', 'topic', { durable: true });
    const q = await channel.assertQueue('notification_queue', { durable: true });

    const routingKeys = Object.keys(eventMap);
    for (const key of routingKeys) {
      await channel.bindQueue(q.queue, 'mcia_events', key);
    }

    console.log(`📥 Notification consumer listening for: ${routingKeys.join(', ')}`);

    channel.consume(q.queue, async (msg) => {
      if (!msg) return;

      const routingKey = msg.fields.routingKey;
      const eventConfig = eventMap[routingKey];

      if (!eventConfig) {
        channel.ack(msg);
        return;
      }

      try {
        const data = JSON.parse(msg.content.toString());
        const userId = data.authorId || data.reviewerId || 'system';

        await prisma.notification.create({
          data: {
            userId,
            type: eventConfig.type,
            title: eventConfig.title,
            body: eventConfig.getBody(data),
            resourceId: data.id || data.changeRequestId,
          },
        });

        console.log(`[Notification] Created [${eventConfig.type}] for user: ${userId}`);
        channel.ack(msg);
      } catch (err) {
        console.error(`[Notification] Failed to process event ${routingKey}:`, err);
        channel.nack(msg, false, false);
      }
    });
  } catch (err) {
    console.error('❌ Notification consumer failed to connect to RabbitMQ:', err);
  }
};
