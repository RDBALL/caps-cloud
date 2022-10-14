'use strict';

const Chance = require('chance');
const chance = new Chance();
const { Consumer } = require('sqs-consumer');
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});
const sns = new AWS.SNS();
const date = new Date();
const time = date.toTimeString();

setInterval(() => {
  const order = {
    orderId: chance.guid(),
    customer: chance.name(),
    address: chance.address(),
    vendorId: 'CAPS',
    timestamp: time
  };
  const payload = {
    Message: JSON.stringify(order),
    TopicArn: 'arn:aws:sns:us-west-2:972392329703:driverSNS',
  };
  sns.publish(payload).promise().then(result => {
    console.log('\nNew order received \n ----->', payload.Message)
    console.log('\nOrder ready for pickup \n ----->', order)
  })
  .catch(err => console.error(err.message));
}, 20000);

const app = Consumer.create({
  queueUrl: 'https://sqs.us-west-2.amazonaws.com/972392329703/vendorQueue',
  handleMessage: async(message) => console.log('\nOrder has been delivered by a driver: \n ----->', message.Body.slice(1,49)),
  pollingWaitTimeMs: 10000
});

app.start();