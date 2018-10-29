const sns = require('./sns.js');
const helpers = require('./helpers');

const subject = '[Mailgun Event Listener] Invalid Event'

exports.assertPermanentFail = async function(eventData) {
  if (eventData.event === 'failed' && eventData.severity === 'permanent') {
    return;
  }
  else {
    const expected = 'failed (permanent)';
    const received = eventData.event === 'failed' ? `failed (${eventData.severity})` : $eventData.event;
    const errMsg = `Invalid event type: expected "${expected}" but received "${received}"`;
    console.error(errMsg);
    const snsMsg = getInvalidEventMessage(expected, received, eventData);
    await sns.publish(process.env.SNS_TOPIC_ARN, snsMsg, subject);
    throw new Error(errMsg);;
  }
}

function getInvalidEventMessage(expectedEvent, actualEvent, eventData) {
  return `The handler for "${expectedEvent}" events received an event of the following type: "${actualEvent}".

Concerned message: ${helpers.getMessageUri(eventData.message.headers['message-id'])}`
}