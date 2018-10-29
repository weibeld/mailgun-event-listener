const sns = require('./sns.js');

/* Lambda function handler */
exports.handler = async function (event, context) {

  const body = JSON.parse(event.body);

  // TODO: verify signature (https://documentation.mailgun.com/en/latest/user_manual.html#webhooks)
  const signature = body.signature;
  const eventData = body["event-data"];

  // If receiving invalid Mailgun event. This shouldn't happen, unless you
  // configure the Mailgun webhook URLs wrongly.
  if (eventData.event !== 'failed') {
    const msg = formatInvalidEventMessage(eventData);
    const subject = '[Mailgun Event Listener] Invalid Event';
    console.error(`Received invalid event: ${JSON.stringify(eventData)}`);
    try {
      await sns.publish(process.env.SNS_TOPIC_ARN, msg, subject);
      return { statusCode: 500, body: JSON.stringify('Invalid event') };
    }
    catch (err) {
      return { statusCode: 500, body: JSON.stringify(err) };
    }
  }

  // TODO: also handle "temporary fail" events

  // If receiving "permanent fail" Mailgun event
  const msg = formatFailMessage(eventData);
  const subject = '[Mailgun Event Listener] Permanent Fail';
  console.log('Received permanent fail event');
  try {
    await sns.publish(process.env.SNS_TOPIC_ARN, msg, subject);
    return { statusCode: 200, body: JSON.stringify('OK') };
  }
  catch (err) {
    return { statusCode: 500, body: JSON.stringify(err) };
  }
}

function formatInvalidEventMessage(eventData) {
  const msgUri = makeMessageUri(eventData.message.headers['message-id']);
  return `Received unexpected Mailgun event for the following message:

${msgUri}

Received event: ${eventData.event}
Expected event: failed`
}

function formatFailMessage(eventData) {
  const from = eventData.message.headers.from;
  const to = eventData.message.headers.to;
  const subject = eventData.message.headers.subject;
  const msgUri = makeMessageUri(eventData.message.headers['message-id']);
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

function makeMessageUri(msgId) {
  return `https://app.mailgun.com/app/logs/${process.env.MAILGUN_DOMAIN}/${encodeURIComponent(msgId)}/history`
}
