const StatsD = require('node-statsd');
const AWS = require('aws-sdk');
// const https = require('https');
const Promise = require('bluebird');

const model = require('./models/index.js');

const statsd = new StatsD({ host: process.env.STATSD_URL, port: 8125 });

// const agent = new https.Agent({ maxSockets: 999 });
// AWS.config.update({ region: 'us-west-1', httpOptions: { agent } });
AWS.config.update({ region: 'us-west-1' });

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

const QueueUrl = process.env.VIDEOS_QUEUE_URL;

const receiveParams = {
  AttributeNames: [
    'SentTimestamp',
  ],
  MaxNumberOfMessages: 10,
  MessageAttributeNames: [
    'All',
  ],
  QueueUrl,
  VisibilityTimeout: 30,
  WaitTimeSeconds: 20,
};

const sendBatchParams = {
  Entries: [],
  QueueUrl: process.env.ENTRY_QUEUE_URL,
};

let sendDebounce;

const processMessage = function processMessagesToModels(message, callback) {
  const sendParams = {
    MessageBody: '',
    QueueUrl: '',
    DelaySeconds: 0,
  };

  const msgParams = {
    Id: '',
    MessageBody: '',
    DelaySeconds: 0,
  };

  if (message.route === '/videos') {
    if (message.method === 'GET') {
      model.list(message.data, (data) => {
        msgParams.Id = `${sendBatchParams.Entries.length}`;
        msgParams.MessageBody = JSON.stringify({ id: message.id, data, res: message.res });
        sendBatchParams.Entries.push(msgParams);

        clearTimeout(sendDebounce);
        if (sendBatchParams.Entries.length > 9) {
          sqs.sendMessageBatch(sendBatchParams, (err) => {
            if (err) console.log(err);
          });
          sendBatchParams.Entries = [];
        } else {
          sendDebounce = setTimeout(() => {
            sqs.sendMessageBatch(sendBatchParams, (err) => {
              if (err) console.log(err);
            });
            sendBatchParams.Entries = [];
          }, 500);
        }

        callback();
      });
    } else if (message.method === 'POST') {
      model.insert(message.data, (data) => {
        sendParams.MessageBody = JSON.stringify({ data });
        sendParams.QueueUrl = process.env.ENTRY_QUEUE_URL;
        sqs.sendMessage(sendParams, (err) => {
          if (err) console.log(err);
        });
        sendParams.QueueUrl = process.env.RELATED_QUEUE_URL;
        sqs.sendMessage(sendParams, (err) => {
          if (err) console.log(err);
        });
      });
    }
  } else if (message.route === '/videos/views') {
    if (message.method === 'PUT') {
      model.views(message.data, callback);
    }
  } else {
    callback();
  }
};

const receive = function receiveFromQueue() {
  return new Promise((resolve, reject) => {
    sqs.receiveMessage(receiveParams, (err, data) => {
      if (err) {
        console.log('Error: ', err);
        reject();
      } else if (data.Messages) {
        const deleteBatchParams = {
          Entries: [],
          QueueUrl,
        };

        data.Messages.forEach((message) => {
          const deleteParams = {
            Id: message.MessageId,
            ReceiptHandle: message.ReceiptHandle,
          };

          const start = new Date();
          processMessage(JSON.parse(message.Body), () => {
            statsd.timing('response_time', new Date() - start, 0.1);
          });

          deleteBatchParams.Entries.push(deleteParams);
        });

        sqs.deleteMessageBatch(deleteBatchParams, (error) => {
          if (err) console.log(error);
        });

        resolve();
      } else {
        resolve();
      }
    });
  });
};

const wrapper = async function recieveWrapper() {
  while (true) {
    await receive();
  }
};

for (let i = 0; i < 3; i += 1) {
  setTimeout(() => wrapper(), 0);
}
