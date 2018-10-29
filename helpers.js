const config = require('./config');

exports.getMessageUri = function(msgId) {
  return `https://app.mailgun.com/app/logs/${config.mailgunDomain}/${encodeURIComponent(msgId)}/history`
}

exports.getSnsMessageSubject = function(str) {
  return `[Mailgun Event Listener] ${str}`;
}