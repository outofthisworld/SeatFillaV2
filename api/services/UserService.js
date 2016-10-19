const uuid = require('node-uuid')

module.exports = {
  createUser: function (req) {
    const _self = this

    return new Promise(function createUser (resolve, reject) {

      // Create a new user tuple
      User.create(req.allParams()).exec(function create (err, user) {
        sails.log.debug('Creating user')

        // Well ofc..
        if (err || !user) {
          sails.log.debug('Error creating user')
          sails.log.error(err)
          // Debug something
          return reject(err)
        }

        // Get rid of confedential information..
        delete user.password
        delete user.passwordConfirmation

        return resolve(user)
      })
    }).then(function (user) {
      sails.log.debug('Creating address for user: ' + JSON.stringify(user))

      _self.createUserAddress(user.id, user).then(function (val) {
        return Promise.resolve({user,address: val.address,countryInfo: val.countryInfo})
      }).catch(function (err) {
        sails.log.error(err)
        return Promise.reject()
      })
    }).then(function (user_partial) {

      // Create user settings (preferences)
      UserSettings.create({
        id: user_partial.user.id,
        localePreference: req.headers['Accept-Language'] || 'en-US'
      }).exec(function (err, userSettings) {
        if (err) {
          sails.log.error(err)
          return Promise.reject(err)
        } else {
          user_partial.userSettings = userSettings
          return Promise.resolve(user_partial)
        }
      })
    }).then(function (user) {
      sails.log.debug('Creating sign up record for user: ' + JSON.stringify(user))

      // Register the sign up..
      return new Promise(function (resolve, reject) {
        Signup.create({ ip: req.ip, user_agent: req.headers['user-agent'], user: user.user.id })
          .exec(function handleVerificationProcess (err, signup) {

            // Handle error
            if (err) {
              sails.log.debug('Error creating sign up record for user id :' + user.user.id + 'Error: ' + err)
              return reject({ error: err, message: 'error creating sign up record' })
            }

            // Store verification id 
            user.user.verificationId = signup.id

            // Get the registration email template
            const message = sails.config.email.messageTemplates.registration(user.user)

            sails.log.debug('Created email template ' + JSON.stringify(message))

            // Send an email async
            EmailService.sendEmailAsync(message).then(function getInfo (info) {
              sails.log.debug('Succesfully sent email... ' + info)
            }).catch(function (err) {
              sails.log.error(err)
              // Error sending email.. handle it
              sails.log.debug('Failed to send email... ' + message + 'error: ' + err)
              return reject({ error: err, message: 'Error sending email' })
            })

            // Lets broadcast a message..
            NotificationService.sendDedicatedNotificationAsync(req)({
              title: 'You have succesfully registered!',
              message: "Thank-you for registering at SeatFilla, don't forget to validate your email!"
            })

            return resolve(user)
          })
      })
    })
  },
  createUserAddress(userId, addressInfo) {
    // Attempt to look up country info
    return UserLocationService.findOrCreateCountry(adressInfo.country).then(function (country) {
      addressInfo.countryInfo = country.alpha3code
      addressInfo.user = userId

      // Create an address and use the alpha 3 country code 
      // to link to the country table. Note that
      // country name is being duplicated as its required the most.
      Address.findOrCreate(addressInfo).exec(function (err, address) {
        // We couldn't create the address record.. log the error
        if (err || !addressInfo) {
          sails.log.debug('Error creating address: ' + addressInfo + ' ' + err)
          sails.log.error(err)
          return Promise.reject({ error: err, message: 'Error creating address record' })
        } else {
          // Return a promise with the collected user info so far.
          return Promise.resolve({ address, countryInfo})
        }
      })
    }).catch(function (err) {
      sails.log.error(err)
      return Promise.reject(err)
    })
  },
  // Creates an external passport user.
  createExternalUser: function (req, accessToken, refreshToken, profile) {
    sails.log.debug('Creating external user')

    return new Promise(function (resolve, reject) {
      const providerKey = profile.provider + 'Id'
      const find = { provider: profile.provider }
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
            } else {
              return null
            }
          })(),
          username: (function () {
            if (!this.email) {
              return firstName + lastName + Math.ceil((Math.random() + 0.01) *
                  ((Math.random() * 2000) + (Math.random() * 99999)))
            } else {
              return null
            }
          })(),
          profile_image_url: (function () {
            if (Array.isArray(profile.photos) && profile.photos.length > 0) {
              return profile.photos[0].value
            } else {
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
          } else {
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
      } else if (obj && obj.id) {
        destroy(obj.id)
      } else if (Number.isInteger(obj)) {
        destroy(obj)
      } else {
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
      const cb = function (err, u) {
        if (err) return reject(err)
        else return resolve(u)
      }
      if (obj.user) {
        obj.user.changePassword(pass, cb)
      } else if (obj.changePassword) {
        obj.changePassword(pass, cb)
      }
    })
  },
  saveUserImage(user, fileName, imageData, onFinish) {
    const path = '../images/users/' + user.email + '/profile-images/' + uuid.uuid() + fileName
    FileService.writeBinaryFile(path, imageData, onFinish)
  }
}
