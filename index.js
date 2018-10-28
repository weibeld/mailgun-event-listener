const aws = require('aws-sdk');
aws.config.update({region: 'us-east-1'});
const sns = new aws.SNS();

/* Lambda function handler */
exports.handler = async function(event, context) {

    const body = JSON.parse(event.body);

    // TODO: verify signature (https://documentation.mailgun.com/en/latest/user_manual.html#webhooks)
    const signature = body.signature;
    const eventData = body["event-data"];

    // If receiving invalid Mailgun event
    if (eventData.event !== 'failed' || eventData.severity !== 'permanent') {
      const msg = formatInvalidEventMessage(eventData);
      const subject = '[Mailgun Event Listener] Invalid Event';
      console.error(`Received invalid event: ${JSON.stringify(eventData)}`);
      try {
        await sendMessage(subject, msg);
        console.log('Publishing SNS message successful');
        return {statusCode: 500, body: JSON.stringify('Invalid event')};
      }
      catch(err) {
        console.log(`Publishing SNS message failed: ${err}`);
        return {statusCode: 500, body: JSON.stringify(err)};
      }
    }

    // TODO: also handle "temporary fail" events

    // If receiving "permanent fail" Mailgun event
    const msg = formatPermanentFailMessage(eventData);
    const subject = '[Mailgun Event Listener] Permanent Fail';
    console.log('Received permanent fail event');
    try {
      await sendMessage(subject, msg);
      console.log('Publishing SNS message successful');
      return {statusCode: 200, body: JSON.stringify('OK')};
    }
    catch(err) {
      console.log(`Publishing SNS message failed: ${err}`);
      return {statusCode: 500, body: JSON.stringify(err)};
    }
};

function sendMessage(subject, message) {
  const params = {
    Subject: subject,
    Message: message,
    TopicArn: process.env.SNS_TOPIC_ARN
  };
  return sns.publish(params).promise();
}

function formatInvalidEventMessage(eventData) {
  const msgUri = makeMessageUri(eventData.message.headers['message-id']);
  return `Received invalid Mailgun event for the following message:

${msgUri}

Actual:
Event: ${eventData.event}
Severity: ${eventData.severity}

Expected:
Event: failed
Severity: permanent`
}

function formatPermanentFailMessage(eventData) {
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
