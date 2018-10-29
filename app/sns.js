const aws = require('aws-sdk');
aws.config.update({ region: 'us-east-1' });
const sns = new aws.SNS();

exports.publish = async function(topic, message, subject) {
  const params = {
    Subject: subject,
    Message: message,
    TopicArn: topic
  };
  try {
    await sns.publish(params).promise();
    console.log('Publishing SNS message successful');
  }
  catch(err) {
    console.log(`Publishing SNS message failed: ${err}`);
    throw err;
  }
}