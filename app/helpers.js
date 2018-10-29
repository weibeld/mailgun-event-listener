exports.getMessageUri = function(msgId) {
    return `https://app.mailgun.com/app/logs/${process.env.MAILGUN_DOMAIN}/${encodeURIComponent(msgId)}/history`
  }