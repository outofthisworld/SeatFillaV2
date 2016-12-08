const uuid = require('node-uuid')

module.exports = {
  createUser: function (options) {
    const _self = this

    const user = options.user,
      ip = options.ip,
      locale = options.locale,
      userAgent = options.userAgent

    if (!user || !ip || !locale || !userAgent) {
      return Promise.reject(new Error('Invalid params'))
    }

    user.displayName = user.username
    // Create user
    return User.create(user).then(function create (user) {
      sails.log.debug('Creating user')

      // Well ofc..
      if (!user) {
        sails.log.debug('Error creating user')

        // Debug something
        return Promise.reject(err)
      }
      // Get rid of confedential information..
      delete user.password
      delete user.passwordConfirmation

      return Promise.resolve(user)
    }).then(function (user) {
      sails.log.debug('Creating address for user: ' + JSON.stringify(user))

      // Create address
      return _self.findOrCreateUserAddress(user.id, user).then(function (val) {
        return Promise.resolve({
          user,
          address: val.address,
          countryInfo: val.countryInfo
        })
      }).catch(function (err) {
        err = err || new Error('Unknown error')
        err.modelErrors = err.modelErrors || []
        err.modelErrors.push({
          model: 'User',
          id: user.id
        })
        return Promise.reject(err)
      })
    }).then(function (user_partial) {
      sails.log.debug('User partial is: ' + JSON.stringify(user_partial))

      // Create user settings (preferences)
      return UserSettings.create({
        id: user_partial.user.id,
        localePreference: locale
      }).then(function (userSettings) {
        user_partial.userSettings = userSettings
        return Promise.resolve(user_partial)
      }).catch(function (err) {
        err.modelErrors = err.modelErrors || []
        err.modelErrors.push({
          model: 'User',
          id: user_partial.user.id
        })
        err.modelErrors.push({
          model: 'Address',
          id: user_partial.address.id
        })
        return Promise.reject(err)
      })
    }).then(function (user_partial) {

      // Create user profile
      return UserProfile.create({
        user: user_partial.user.id,
        description: 'Welcome to Seatfilla'
      }).then(function (userProfile) {
        user_partial.userProfile = userProfile
        return Promise.resolve(user_partial)
      }).catch(function (err) {
        err.modelErrors = err.modelErrors || []
        err.modelErrors.push({
          model: 'User',
          id: user_partial.user.id
        })
        err.modelErrors.push({
          model: 'Address',
          id: user_partial.address.id
        })
        err.modelErrors.push({
          model: ' UserSettings',
          id: user_partial.userSettings.id
        })
        return Promise.reject(err)
      })
    }).then(function (user_partial) {
      sails.log.debug('Creating sign up record for user: ' + JSON.stringify(user_partial))

      // Register the sign up..
      return Signup.create({
        ip,
        user_agent: userAgent,
        user: user_partial.user.id
      }).then(function (signup) {
        user_partial.user.verificationId = signup.id
        return Promise.resolve(user_partial)
      }).catch(function (err) {
        sails.log.debug('Error creating sign up record for user id :' + user_partial.user.id + 'Error: ' + err)
        err.modelErrors = err.modelErrors || []
        err.modelErrors.push({
          model: 'User',
          id: user_partial.user.id
        })
        err.modelErrors.push({
          model: 'Address',
          id: user_partial.user.address.id
        })
        err.modelErrors.push({
          model: 'UserSettings',
          id: user_partial.user.userSettings.id
        })
        err.modelErrors.push({
          model: 'UserProfile',
          id: user_partial.userProfile.id
        })
        return Promise.reject(err)
      })
    }).then(function (user_partial) {
      const message = sails.config.email.messageTemplates.registration(user_partial.user)
      sails.log.debug('Created email template ' + JSON.stringify(message))

      if (!user_partial.user.isEmailVerified) {
        // Send an email async
        return EmailService.sendEmailAsync(message).then(function getInfo (info) {
          sails.log.debug('Succesfully sent email... ' + info)
          return Promise.resolve(user_partial)
        }).catch(function (err) {
          sails.log.error(err)
          // Error sending email.. handle it
          sails.log.debug('Failed to send email... ' + message + 'error: ' + err)
          err.modelErrors = err.modelErrors || []
          err.modelErrors.push({
            model: 'User',
            id: user_partial.user.id
          })
          err.modelErrors.push({
            model: 'Address',
            id: user_partial.address.id
          })
          err.modelErrors.push({
            model: 'UserSettings',
            id: user_partial.userSettings.id
          })
          err.modelErrors.push({
            model: 'Signup',
            id: signup.id
          })
          err.modelErrors.push({
            model: 'UserProfile',
            id: user_partial.userProfile.id
          })
          sails.log.debug('Error sending email in UserService.js/createUser')
          return reject(err)
        })
      }else {
        return Promise.resolve(user_partial)
      }
    }).catch(function (err) {

      // Catch and fix and model errors during this proccess 
      if (err.modelErrors) {
        sails.log.debug('Correcting any model errors')
        try {
          err.modelErrors.forEach(function (modelError) {
            if (!modelError.model || !modelError.id) {
              return Promise.reject(new Error('Invalid model error, no model or id attribute'))
            }

            if (modelError.model in sails.models && '_attributes' in sails.model[modelError.model]) {
              for (var key in sails.models[modelError.model]._attributes) {
                if ('primaryKey' in sails.models[modelError.model]._attributes[key] &&
                  sails.models[modelError.model]._attributes[key]['primaryKey']) {
                  if (!sails.models[modelErros.model]._attributes[key]['type'])
                    return Promise.reject(new Error('Could not determine type of model attribute ' + key))

                  const modelPrimaryKey = key

                  sails.model[modelError.model].destroy({
                    modelPrimaryKey: modelError.id
                  }).then(function () {
                    sails.log.debug('Destoryed record for model ' + modelError.model + ' with id ' + modelError.id)
                  }).catch(function (err) {
                    sails.log.error(err)
                  })
                }
              }
              return Promise.reject(err)
            } else {
              return Promise.reject(new Error('Invalid model specified for model errors'))
            }
          })
        } catch (error) {
          sails.log.error(error)
          return Promise.reject(err)
        }
      } else {
        sails.log.error(err)
        return Promise.reject(err)
      }
    })
  },
  findOrCreateUserAddress(userId, addressInfo) {
    sails.log.debug('AddressInfo in UserService.js/findOrCreateAddress is:')
    sails.log.debug(JSON.stringify(addressInfo))
    sails.log.debug('Calling UserLocationService.js/findOrCreateCountry with data ' + addressInfo.country)
    // Attempt to look up country info

    return UserLocationService.findOrCreateCountry(addressInfo.country).then(function (country) {
      sails.log.debug('Country info after calling UserLocationService.js/findOrCreateCountry ')
      sails.log.debug(JSON.stringify(country))

      addressInfo.countryInfo = country.alpha3Code
      addressInfo.user = userId.id || userId

      sails.log.debug('Final address info: ')
      sails.log.debug(JSON.stringify(addressInfo))

      // Create an address and use the alpha 3 country code 
      // to link to the country table. Note that
      // country name is being duplicated as its required the most.
      return new Promise(function (resolve, reject) {
        Address.findOrCreate(addressInfo, addressInfo, function (err, address) {
          if (err) {
            sails.log.error(err)
            return reject(err)
          } else {
            // We couldn't create the address record.. log the error
            sails.log.debug('Found or created address : ' + JSON.stringify(address))
            // Return a promise with the collected user info so far.
            return resolve({
              address,
              countryInfo: country
            })
          }
        })
      })
    }).catch(function (err) {
      sails.log.error(err)
      return Promise.reject(err)
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
  logout(req) {
    if (!req.user) return

    req.logout()
    req.session.destroy()
  },
  logUserIn(req, critera, user) {
    if (!req) Promise.reject(new Error('Invalid params'))

    function logIn (req, user) {
      req.logout() || req.logOut()
      return new Promise(function (resolve, reject) {
        req.login(user, function (err) {
          if (err) {
            sails.log.error(err)
            return resolve(false)
          }else {
            return resolve(true)
          }
        })
      })
    }
    if (!user && critera) {
      return User.findOne(critera)
        .then(function (user) {
          if (user) {
            return logIn(req, user)
          }else {
            return Promise.resolve(false)
          }
        })
    }else if (user) {
      return logIn(req, user)
    }else {
      throw Promise.reject(new Error('Invalid params to log user in'))
    }
  },
  saveUserImage(user, fileName, imageData, onFinish) {
    const path = '../images/users/' + user.email + '/profile-images/' + uuid.uuid() + fileName
    FileService.writeBinaryFile(path, imageData, onFinish)
  }
}
