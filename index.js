const config = require('./helpers/config');
const sns = require('./helpers/sns');
const notifications = require('./helpers/notifications');

exports.handler = async function (event, context) {
  const mailgunEvent = JSON.parse(event.body);
  // TODO: verify signature (https://documentation.mailgun.com/en/latest/user_manual.html#webhooks)
  const signature = mailgunEvent.signature;
  const eventData = mailgunEvent["event-data"];

  let message;
  let subject;
  switch (eventData.event) {
    case 'failed':
      switch (eventData.severity) {
        case 'permanent':
          console.log('Received "failed (permanent)" event');
          message = notifications.getFailedPermanentMessage(eventData);
          subject = notifications.getFailedPermanentSubject();
          break;
        case 'temporary':
          console.log('Received "failed (temporary)" event');
          message = notifications.getFailedTemporaryMessage(eventData);
          subject = notifications.getFailedTemporarySubject();
          break;
        default:
          console.error(`Received unknown event: "failed (${eventData.severity})"`);
          message = notifications.getUnknownEventMessage(eventData);
          subject = notifications.getUnknownEventSubject(eventData);
          break;
      }
      break;
    default:
      console.error(`Received unknown event: "${eventData.event}"`);
      message = notifications.getUnknownEventMessage(eventData);
      subject = notifications.getUnknownEventSubject(eventData);
      break;
  }

  try {
    await sns.publish(config.snsTopicArn, message, subject);
    return { statusCode: 200, body: "OK" };
  } catch(err) {
    return { statusCode: 500, body: "Could not send notification message" };
  }
}