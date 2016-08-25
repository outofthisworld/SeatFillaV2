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

            // Lets broadcast a message..
            NotificationService.sendDedicatedNotificationAsync(req)({
              title: 'You have succesfully registered!',
              message: "Thank-you for registering at SeatFilla, don't forget to validate your email!"
            })
          })
        return resolve(user)
      })
    })
  },
  // Creates an external passport user.
  createExternalUser: function (req, accessToken, refreshToken, profile) {
    return new Promise(function (resolve, reject) {
      const providerKey = profile.provider + 'Id'
      const find = {provider: profile.provider}
      find[providerKey] = profile.id

      // Cheap hacks >.< (they all provide different data.. makes model validation hard too)
      const externalInfo = {
        twitter: {
          username: (function () {
            return profile.username
          })(),
          provider: (function () {
            return profile.provider
          })(),
          firstName: (function () {
            return profile._json.name
          })(),
          profile_image_url: (function () {
            return profile._json.profile_image_url || null
          })(),
          emailIsVerified: (function () {
            return false
          })(),
          isLockedOut: false
        },
        facebook: {
          provider: (function () {
            return profile.provider
          })(),
          firstName: (function () {
            return profile.name.givenName
          }()),
          middleName: (function () {
            return profile.name.middleName
          })(),
          lastName: (function () {
            return profile.name.familyName
          })(),
          email: (function () {
            if (Array.isArray(profile.emails) && profile.emails.length > 0) {
              return profile.emails[0].value
            }else {
              return null
            }
          })(),
          username: (function () {
            if (!this.email) {
              return firstName + lastName + Math.ceil((Math.random() + 0.01) *
                  ((Math.random() * 2000) + (Math.random() * 99999)))
            }else {
              return null
            }
          })(),
          profile_image_url: (function () {
            if (Array.isArray(profile.photos) && profile.photos.length > 0) {
              return profile.photos[0].value
            }else {
              return null
            }
          })(),
          emailIsVerified: (function () {
            return this.email || false
          })(),
          isLockedOut: false
        },
        google: {

        }
      }

      const create = externalInfo[profile.provider]
      if (!create) return reject(new Error('Unsupported provider !!' + profile.provider))

      create[providerKey] = profile.id

      User.findOrCreate(find, create,
        function (err, user) {
          if (err) { return reject(err || new Error('Could not create user')) }

          if (create.profile_image_url) {
            UserImage.create({
              user: user.id,
              url: create.profile_image_url
            }).exec(function (err, userImage) {})
          }
          res.session.provider = profile.provider
          req.session[req.session.provider] = {}
          req.session[req.session.provider].accessToken = accessToken
          req.session[req.session.provider].refreshToken = refreshToken

          if (user.emailIsVerified) {
            NotificationService.sendDedicatedNotificationAsync(req)({
              title: 'Thank-you for registering with SeatFilla via ' + profile.provider,
              message: 'Your email has been automatically verified, no further action is required!'
            })
          }else {
            NotificationService.sendDedicatedNotificationAsync(req)({
              title: 'Thank-you for registering with SeatFilla via ' + profile.provider,
              message: 'Please provide your email so we can validate your account!'
            })
          }

          return resolve(user)
        })
    })
  },
  deleteUser: function (obj) {
    return new Promise(function (resolve, reject) {
      const destroy = function (id) {
        User.destroy(id).exec(function (err, res) {
          if (err) return reject(err)
          else return resolve(res)
        })
      }
      if (obj && obj.user && obj.user.id) {
        destroy(obj.user.id)
      }else if (obj && obj.id) {
        destroy(obj.id)
      }else if (Number.isInteger(obj)) {
        destroy(obj)
      }else {
        reject(new Error('Could not find id associated with user'))
      }
    })
  },
  verifyPasswordAsync: function (obj, passToVerify) {
    return new Promise(function (resolve, reject) {
      if (obj.user) return obj.user.verifyPassword(passToVerify)
      else if (obj.changePassword) return obj.verifyPassword(passToVerify)
    })
  },
  changePasswordAsync: function (obj, pass) {
    return new Promise(function (resolve, reject) {
      const cb = function (err, u) {if (err) return reject(err)
        else return resolve(u)
      }
      if (obj.user) {
        obj.user.changePassword(pass, cb)
      } else if (obj.changePassword) {
        obj.changePassword(pass, cb)
      }
    })
  }
}
