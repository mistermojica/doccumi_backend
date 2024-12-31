const AWS = require('aws-sdk');

const SES_CONFIG = {
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1',
};

const AWS_SES = new AWS.SES(SES_CONFIG);

const sendEmail = (ctx) => {
    //console.log({ctx});
    let params = {
      Source: 'DOCCUMI <info@doccumi.com>',
      Destination: {
        ToAddresses: [ctx.to],
      },
      ReplyToAddresses: [ctx.from],
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: ctx.content,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: ctx.subject,
        }
      },
    };

    return AWS_SES.sendEmail(params).promise();
};

const sendTemplateEmail = (recipientEmail) => {
    let params = {
      Source: 'info@doccumi.com',
      Template: '',
      Destination: {
        ToAddresses: [
          recipientEmail
        ],
      },
      TemplateData: '{\"name\':\'John Doe\'}'
    };

    return AWS_SES.sendTemplatedEmail(params).promise();
};

module.exports = {
  sendEmail,
  sendTemplateEmail
};
