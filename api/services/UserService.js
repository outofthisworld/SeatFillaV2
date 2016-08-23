module.exports = {
  // req.user.providier = '' before calling..
  createUser: function (req) {
    new Promise((resolve, reject) => {
      User.create(req.allParams()).exec((err, user) => {
        if (err || !user) {
          sails.log.debug('Error when creating user  ', err)
          return reject(err)
        } else {

          // Get rid of confedential information..
          delete user.password
          delete user.passwordConfirmation

          // Register the sign up..
          Signup.create({ip: req.ip,user_agent: req.headers['user-agent'], user: user.id})
            .exec(function (err, signup) {
              if (err) {
                sails.log.debug('Error creating sign up record for user id :' + user.id + 'Error: ' + err)
                return reject(err)
              }else {
                user.verificationId = signup.id
                const message = sails.config.email.messageTemplates.registration(user)
                EmailService.sendEmailAsync(message)
                  .catch((err) => {
                    if (err) {
                      sails.log.debug('Failed to send email... ' + message + 'error: ' + err)
                      User.update(user.id, {isEmailVerified: true}).exec(function (err, updatedUserArr) {
                        if (err) {
                          sails.log.debug('Could not update and set users email to verified '
                            + user.id + 'error: ' + err)
                          return reject(err)
                        }else {
                          return updatedUserArr[0]
                        }
                      })
                    }
                  })
              }
            })
          return resolve(user)
        }
      })
    })
  }
}
