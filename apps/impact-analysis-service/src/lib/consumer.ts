import amqp from 'amqplib';
import { ImpactService } from '../services/impact.service';

const impactService = new ImpactService();

export const startConsumer = async () => {
  const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  
  try {
    const conn = await amqp.connect(rabbitmqUrl);
    const channel = await conn.createChannel();

    await channel.assertExchange('mcia_events', 'topic', { durable: true });
    const q = await channel.assertQueue('impact_analysis_queue', { durable: true });

    await channel.bindQueue(q.queue, 'mcia_events', 'change.submitted');
    
    console.log('📥 Impact Analysis consumer listening for change.submitted events...');

    channel.consume(q.queue, async (msg) => {
      if (!msg) return;

      try {
        const changeRequest = JSON.parse(msg.content.toString());
        console.log(`[Consumer] Received change.submitted for CR: ${changeRequest.id}`);

        await impactService.analyzeImpact({
          changeRequestId: changeRequest.id,
          targetServiceId: changeRequest.targetServiceId,
          changeType: changeRequest.changeType,
        });

        console.log(`[Consumer] Impact report generated for CR: ${changeRequest.id}`);
        channel.ack(msg);
      } catch (err) {
        console.error('[Consumer] Failed to process message', err);
        channel.nack(msg, false, false); // discard to DLX in production
      }
    });
  } catch (err) {
    console.error('❌ Impact Analysis consumer failed to connect to RabbitMQ:', err);
  }
};
