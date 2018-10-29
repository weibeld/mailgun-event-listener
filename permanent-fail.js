const sns = require('./sns');
const eventChecker = require('./event-checker');
const helpers = require('./helpers');
const config = require('./config');

exports.handler = async function (event, context) {

  const mailgunEvent = JSON.parse(event.body);

  // TODO: verify signature (https://documentation.mailgun.com/en/latest/user_manual.html#webhooks)
  const signature = mailgunEvent.signature;
  const eventData = mailgunEvent["event-data"];

  // Check Mailgun event type. If wrong type is received, check webhook URLs.
  try {
    await eventChecker.assertPermanentFail(eventData);
  } catch(err) {
    return { statusCode: 406, body: err.message };
  }

  // Handle "permanent fail" event
  console.log('Handling "failed (permanent)" event');
  const message = getMessage(eventData);
  const subject = '[Mailgun Event Listener] Permanent Fail';
  try {
    await sns.publish(config.snsTopicArn, message, subject);
    return { statusCode: 200, body: "OK" };
  } catch(err) {
    return { statusCode: 500, body: "Could not send notification message" };
  }
}

function getMessage(eventData) {
  const from = eventData.message.headers.from;
  const to = eventData.message.headers.to;
  const subject = eventData.message.headers.subject;
  const msgUri = helpers.getMessageUri(eventData.message.headers['message-id']);
  const deliveryStatusMessage = eventData['delivery-status'].message;
  const deliveryStatusDescription = eventData['delivery-status'].description;
  const deliveryStatusCode = eventData['delivery-status'].code;

  return `Permanent fail for the following message:

${msgUri}

- Subject: ${subject}
- From: ${from}
- To: ${to}

Delivery status:

- Message: "${deliveryStatusMessage}"
- Description: "${deliveryStatusDescription}"
- Code: ${deliveryStatusCode}`
}