/*
    Created by Dale.
    Email service to send and schedule failed emails to be resent.
*/

const nodemailer = require('nodemailer'),
    path = require('path'),
    smtpPool = require('nodemailer-sendgrid-transport'),
    transporter = nodemailer.createTransport(smtpPool(sails.config.email.config)),
    schedule = require('node-schedule'),
    FileUtils = require('../utils/FileUtils')

const rule = new schedule.RecurrenceRule()
const email_service = sails.config.appPath + '/email-service.json'

const exportObj = {
    // Sends an async email
    sendEmailAsync: function(message) {
        return new Promise((resolve, reject) => {
            transporter.sendMail(message, function(err, info) {
                if (err) {
                    sails.log.debug('Error sending email: ' + err.message)
                    return FileUtils.readJsonFileAsync(email_service).then(function(obj) {
                        obj.FailedMessages.push(message)
                        return fs.writeJsonFileAsync(email_service, obj).then(function() {
                            resolve({})
                        }).catch(function(err) {
                            return reject(err)
                        })
                    })
                } else {
                    return resolve(info)
                }
            })
        })
    },
    // Removes a failed message from the scheduled queue by removing it from the JSON file.
    // Will probably used if a user clicks resend verification email or something of the sorts..
    removeFromQueuedEmails: function(email, messageType) {
        FileUtils.readJsonFileAsync(email_service).then(function(data) {
            const failed = data.FailedMessages.reject((failedMessage) => {
                return failedMessage.type === messageType && failedMessage.email === email
            })

            obj.FailedMessages = failed
            FileUtils.writeJsonFileAsync(email_service, data).catch(function(err) {
                sails.log.error(err)
            })
        })
    },
    // Closes the service..
    closeEmailService: function() {
        transporter.close()
    }
}

function init() {

    // Listen to the stream
    transporter.use('stream', function(mail, callback) {
        var addresses = mail.message.getAddresses()
        console.log('From: %s', JSON.stringify(addresses.from))
        console.log('To: %s', JSON.stringify(addresses.to))
        console.log('Cc: %s', JSON.stringify(addresses.cc))
        console.log('Bcc: %s', JSON.stringify(addresses.bcc))
        callback()
    })

    // Verify the server is running
    transporter.verify(function(error, success) {
        if (error) {
            console.log(error)
        } else {
            console.log('Server is ready to take our messages')
        }
    })

    rule.minute = 59

    // Schedule a new email resending task, should an email fail to be sent.
    const j = schedule.scheduleJob(rule, function() {
        sails.log.debug('resending failed emails..')

        FileUtils.readJsonFileAsync(email_service).then(function(data) {
            for (var key in data.FailedMessages) {
                exportObj.sendEmailAsync(e).then(function(info) {
                    obj.FailedMessages.splice(key--, 1)
                }).catch(function(err) {
                    sails.log.debug('Scheduled email service failed to resend email with error ' + err)
                })
            }

            FileUtils.writeJsonFileAsync(email_service, data).catch(function(err) {
                sails.log.error(err)
            })
        }).catch(function(err) {
            sails.log.error(err)
        })
    })
}
init()
module.exports = exportObj