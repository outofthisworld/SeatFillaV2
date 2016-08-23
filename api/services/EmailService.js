const nodemailer = require('nodemailer')
const smtpPool = require('nodemailer-smtp-transport')

// For reading and writing our json file..
var fs = require('fs')

// Create a scheduler for failed emails..
const schedule = require('node-schedule')
const rule = new schedule.RecurrenceRule()
const email_service = 'email-service.json'

// Every hour 59 minutes after the hour..
rule.minute = 59

// Schedule a new email resending task, should an email fail to be sent.
const j = schedule.scheduleJob(rule, function () {
  sails.log.debug('resending failed emails..')
  fs.readFile(email_service, 'utf8', function (err, data) {
        var obj;
        if (!err && module.exports) {
            email_service.FailedMessages.forEach(e, i => {
                module.exports.sendEmailAsync(e).then(function (info) {

                //Parse our data    
                obj = JSON.parse(data);

                //Remove the failed email since its now been sent..
                obj.FailedMessages.splice(i,1);

                }).catch(function (err) {
                    sails.log.debug('Scheduled email service failed to resend email with error ' + err);
                });
             });

              //Write out our
            fs.writeFile(email_service, obj, 'utf8', function (err) {
                if (err) {
                  sails.log.debug('Error writing ' + email_service + ' error: ' + err)
                }
            });
        }
  });
})

// Set up a new transporter
const transporter = nodemailer.createTransport(smtpPool(sails.config.email.config))

// Listen to the stream
transporter.use('stream', function (mail, callback) {
  var addresses = mail.message.getAddresses()
  console.log('From: %s', JSON.stringify(addresses.from))
  console.log('To: %s', JSON.stringify(addresses.to))
  console.log('Cc: %s', JSON.stringify(addresses.cc))
  console.log('Bcc: %s', JSON.stringify(addresses.bcc))
  callback()
})

// Verify the server is running
transporter.verify(function (error, success) {
  if (error) {
    console.log(error)
  } else {
    console.log('Server is ready to take our messages')
  }
})

module.exports = {
  // Sends an async email
  sendEmailAsync: function (message) {
    return new Promise((resolve, reject) => {
      transporter.sendMail(message, function (err, info) {
        if (err) {
          fs.readFile(email_service, 'utf8', function (err, data) {
            if (err) {
              sails.log.debug('Error reading ' + email_service + ' error: ' + err)
              return reject(err)
            }else {
              obj = JSON.parse(data)
              obj.FailedMessages.push(message)
              fs.writeFile(email_service, obj, 'utf8', function (err) {
                if (err) {
                  sails.log.debug('Error writing file ' + email_service + ' error: ' + err)
                  return reject(err)
                }
              })
            }
          })
          return reject(err)
        } else {
          return resolve(info)
        }
      })
    })
  },
  // Closes the service..
  closeEmailService: function () {
    transporter.close()
  }
}
