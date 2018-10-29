const sns = require('./sns.js');
const helpers = require('./helpers');
const config = require('./config');

const subject = '[Mailgun Event Listener] Invalid Event'

exports.assertFailed = async function(severity, eventData) {
  if (eventData.event === 'failed' && eventData.severity === severity) {
    return;
  }
  else {
    const expected = `failed (${severity})`;
    const received = eventData.event === 'failed' ? `failed (${eventData.severity})` : $eventData.event;
    const errMsg = `Invalid event type: expected "${expected}" but received "${received}"`;
    console.error(errMsg);
    const snsMsg = getInvalidEventMessage(expected, received, eventData);
    await sns.publish(config.snsTopicArn, snsMsg, subject);
    throw new Error(errMsg);;
  }
}

function getInvalidEventMessage(expectedEvent, actualEvent, eventData) {
  return `The handler for "${expectedEvent}" events received an event of the following type: "${actualEvent}".

Concerned message: ${helpers.getMessageUri(eventData.message.headers['message-id'])}`
}