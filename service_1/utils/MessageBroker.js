const amqp = require("amqplib");

const handleSubscribeEvents = require("../controllers/handleSubscriberEvent");

const EXCHANGE_NAME = "TEST_RABBIT_MQ";
const CURRENT_SERVICE = "SERVICE 1";
const CURRENT_SERVICE_SINGLE_BINDING_KEY = "SERVICE_1_BINDING_KEY";
const CURRENT_SERVICE_SINGLE_QUEUE = "SERVICE_1_QUEUE";

require('dotenv').config();

const createChannel = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "direct", {
      durable: true,
    });

    return { connection, channel };
  } catch (error) {
    console.log("failed to create amqp channel");
  }
};

const PublishMessage = async (destination_service_binding_key, message) => {
  const { connection, channel } = await createChannel();

  // exchange, spesific queue / routing/ binding key, message
  channel.publish(
    EXCHANGE_NAME,
    destination_service_binding_key,
    Buffer.from(message)
  );

  console.log(
    `Sending message from ${CURRENT_SERVICE} to ${destination_service_binding_key}`
  );

  // close the channel and connection
  await channel.close();
  await connection.close();
};

const SubscribeMessage = async () => {
  const { channel } = await createChannel();

  await channel.assertQueue(CURRENT_SERVICE_SINGLE_QUEUE, { durable: true });

  // binding queue ke exchange dengan routing key yang diinginkan
  // queue name, exchane name, binding/routing key
  channel.bindQueue(
    CURRENT_SERVICE_SINGLE_QUEUE,
    EXCHANGE_NAME,
    CURRENT_SERVICE_SINGLE_BINDING_KEY
  );

  console.log(`Waiting for messages in queue: ${CURRENT_SERVICE_SINGLE_QUEUE}`);

  // param 1 = queue name
  channel.consume(
    CURRENT_SERVICE_SINGLE_QUEUE,
    (message) => {
      if (message) {
        console.log("[X] received");

        const content = message.content.toString();

        handleSubscribeEvents(content);
      }
    },
    {
      noAck: true,
    }
  );
};

module.exports = { PublishMessage, SubscribeMessage };
