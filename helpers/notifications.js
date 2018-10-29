const config = require('./config');

// Failed (permanent)

exports.getFailedPermanentSubject = function() {
  return getSubject('Permanent Fail')
}

exports.getFailedPermanentMessage = function(eventData) {
  const from = eventData.message.headers.from;
  const to = eventData.message.headers.to;
  const subject = eventData.message.headers.subject;
  const msgUri = getMailgunMsgUri(eventData.message.headers['message-id']);
  const deliveryStatus = eventData['delivery-status'];
  return `Received "failed (permanent)" event for the following message:

${msgUri}

- Subject: ${subject}
- From: ${from}
- To: ${to}

Delivery status:

- Message: "${deliveryStatus.message}"
- Description: "${deliveryStatus.description}"
- Code: ${deliveryStatus.code}

A "failed (permanent)" event means that the target email server did not accept this message from Mailgun. There will be no further attempts to deliver this message to the target email server.

${footer()}`
}

// Failed (temporary)

exports.getFailedTemporarySubject = function() {
  return getSubject('Temporary Fail')
}

exports.getFailedTemporaryMessage = function(eventData) {
  const from = eventData.message.headers.from;
  const to = eventData.message.headers.to;
  const subject = eventData.message.headers.subject;
  const msgUri = getMailgunMsgUri(eventData.message.headers['message-id']);
  const deliveryStatus = eventData['delivery-status'];
  return `Received "failed (temporary)" for the following message:

${msgUri}

- Subject: ${subject}
- From: ${from}
- To: ${to}

Delivery status:

- Message: "${deliveryStatus.message}"
- Description: "${deliveryStatus.description}"
- Code: ${deliveryStatus.code}
- Attempt count: ${deliveryStatus['attempt-no']}
- Retry seconds: ${deliveryStatus['retry-seconds']}

A "failed (temporary)" event means that the target email server did not accept this message from Mailgun. However, the rejection is only temporary and Mailgun will attempt to deliver the message to the target email server again after a backoff time.

${footer()}`
}

// Unknown event

exports.getUnknownEventSubject = function(eventData) {
  return getSubject(`Unknown Event "${eventData.event}`)
}

exports.getUnknownEventMessage = function(eventData) {
  const msgUri = getMailgunMsgUri(eventData.message.headers['message-id']);
  return `Received unknown event "${eventData.event}" for the following message:

${msgUri}

This event type is currently not supported.

${footer()}`
}

function getSubject(str) {
  return `[Mailgun Event Listener] ${str}`;
}

function getMailgunMsgUri(msgId) {
  return `https://app.mailgun.com/app/logs/${config.mailgunDomain}/${encodeURIComponent(msgId)}/history`
}

function footer() {
  return 'Mailgun event types: https://documentation.mailgun.com/en/latest/api-events.html#event-types';
}