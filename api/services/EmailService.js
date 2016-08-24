/*
    Created by Dale.
    Email service to send and schedule failed emails to be resent.
*/

const nodemailer = require('nodemailer')
const smtpPool = require('nodemailer-sendgrid-transport')
const transporter = nodemailer.createTransport(smtpPool(sails.config.email.config))
// Create a scheduler for failed emails..
const schedule = require('node-schedule')
const rule = new schedule.RecurrenceRule()
const email_service = 'email-service.json'
rule.minute = 59

module.exports = {
  // Sends an async email
  sendEmailAsync: function (message) {
    return new Promise((resolve, reject) => {
      transporter.sendMail(message, function (err, info) {
        if (err) {
          sails.log.debug('Error sending email: ' + err.message);
          FileService.readFileUTF8Async(email_service, function (err, data) {
            if (err) {
              sails.log.debug('Error reading ' + email_service + ' error: ' + err)
              return reject(err)
            }else {
              obj = JSON.parse(data)
              obj.FailedMessages.push(message)
              fs.writeFileUTF8Async(email_service, obj, function (err) {
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
  // Removes a failed message from the scheduled queue by removing it from the JSON file.
  // Will probably used if a user clicks resend verification email or something of the sorts..
  removeFromQueuedEmails: function (email, messageType) {
    FileService.readFileUTF8Async(email_service, function (err, data) {
      FileService.safeParseJsonAsync(data).then(function (obj) {
        const failed = obj.FailedMessages.reject((failedMessage) => {
          return failedMessage.type === messageType && failedMessage.email === email
        })
        obj.FailedMessages = failed
        FileService.writeFileUTF8Async(email_service, obj, function (err) {
          if (err)  sails.log.debug('Error writing file in EmailService.js @ removeFromQueuedEmails' + email_service + ' error: ' + err)
        })
      })
    })
  },
  // Closes the service..
  closeEmailService: function () {
    transporter.close()
  }
}

function init () {

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

  // Schedule a new email resending task, should an email fail to be sent.
  const j = schedule.scheduleJob(rule, function () {
    sails.log.debug('resending failed emails..')
    FileService.readFileUTF8Async(email_service, function (err, data) {
      var obj
      if (!err && module.exports) {
        email_service.FailedMessages.forEach(e, i => {
          module.exports.sendEmailAsync(e).then(function (info) {
            obj = JSON.parse(data)
            obj.FailedMessages.splice(i, 1)
          }).catch(function (err) {
            sails.log.debug('Scheduled email service failed to resend email with error ' + err)
          })
        })
        FileService.writeFileUTF8Async(email_service, obj, function (err) {
          if (err) {
            sails.log.debug('Error writing ' + email_service + ' error: ' + err)
          }
        })
      }
    })
  })
}

init();