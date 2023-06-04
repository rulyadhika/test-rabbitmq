const { PublishMessage } = require("./utils/MessageBroker");

PublishMessage(
  "SERVICE_2_BINDING_KEY",
  JSON.stringify({ message: "hello world from service 1" })
);