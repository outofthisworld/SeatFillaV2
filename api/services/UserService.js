module.exports = {
  createUser: function (req) {
    return new Promise(function createUser (resolve, reject) {
      User.create(req.allParams()).exec(function create (err, user) {
        sails.log.debug('in create user')

        // Well ofc..
        if (err || !user) {
          // Debug something
          return reject(err)
        }

        // Get rid of confedential information..
        delete user.password
        delete user.passwordConfirmation

        // Register the sign up..
        Signup.create({ip: req.ip,user_agent: req.headers['user-agent'], user: user.id})
          .exec(function handleVerificationProcess (err, signup) {

            // Handle error
            if (err) {
              sails.log.debug('Error creating sign up record for user id :' + user.id + 'Error: ' + err)
              return reject(err)
            }

            // Store verification id 
            user.verificationId = signup.id

            // Get the registration email template
            const message = sails.config.email.messageTemplates.registration(user)

            sails.log.debug('Created email template ' + message)

            // Send an email async
            EmailService.sendEmailAsync(message).then(function getInfo (info) {
              sails.log.debug('Succesfully sent email... ' + info)
            }).catch(function (err) {
              // Error sending email.. handle it
              sails.log.debug('Failed to send email... ' + message + 'error: ' + err)
              reject(err)
            })
          })
        return resolve(user)
      })
    })
  },
  deleteUser: function () {}
}
