const { PublishMessage } = require("./utils/MessageBroker");

PublishMessage(
  "SERVICE_1_BINDING_KEY",
  JSON.stringify({ message: "hello world from service 2" })
);
