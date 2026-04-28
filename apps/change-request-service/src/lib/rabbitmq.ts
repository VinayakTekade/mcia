import amqp from 'amqplib';

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    channel = await conn.createChannel();
    await channel.assertExchange('mcia_events', 'topic', { durable: true });
    console.log('🐰 Connected to RabbitMQ');
  } catch (error) {
    console.error('RabbitMQ Connection Failed', error);
  }
};

export const publishEvent = (routingKey: string, data: any) => {
  if (!channel) {
    console.warn(`[RabbitMQ] Cannot publish '${routingKey}' — channel not ready. Event lost.`);
    return;
  }
  channel.publish('mcia_events', routingKey, Buffer.from(JSON.stringify(data)), {
    persistent: true
  });
};
