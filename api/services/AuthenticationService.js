const passport = require('passport')

module.exports = {
  authenticateLocal(req, res, object) {
    if (req.user) {
      req.logOut() || req.logout()
    }

    return new Promise(function (resolve, reject) {
      (passport.authenticate('local', function (err, user) {
        if (err || !user) {
          sails.log.debug('Error authentication via passport')
          sails.log.error(err)
          sails.log.debug(user)
          return resolve({
            status: err && err.status || sails.config.passport.errorCodes().ErrorUnknown,
            error: err || new Error('Error unknown'),
            errorMessage: err && err.message || 'Unknown error'
          })
        } else {
          req.login(user, function (err) {
            sails.log.debug('logging user in')
            if (err) {
              sails.log.debug('Failed to log on user to req in controllers/authcontroller.js')
              sails.log.error(err)
              return resolve({
                status: sails.config.passport.errorCodes().ErrorUnknown,
                error: err,
                errorMessage: err.message,
                messagelocal: 'Failed to log on user to req in controllers/authcontroller.js'
              })
            } else {
              sails.log.debug('Succesfully logged on user via passport in controllers/authcontroller.js')
              sails.log.debug('User logging in: ' + user)
              return resolve({
                status: sails.config.passport.errorCodes().Success,
                user: req.user
              })
            }
          })
        }
      }))(req, res)
    }).catch(function (err) {
      sails.log.error(err)
      return Promise.reject({
        status: sails.config.passport.errorCodes().ErrorUnknown,
        error: err,
        errorMessage: err.message
      })
    })
  },
  authenticateFacebook(req, res) {
    req.logOut() || req.logout()

    return new Promise(function (resolve, reject) {
      passport.authenticate('facebook', {
        scope: ['public_profile', 'email', 'user_friends', 'manage_pages', 'user_about_me', 'user_photos', 'user_friends',
          'user_birthday', 'user_hometown', 'user_location']
      })(req, res, function (err) {
        if (err) {
          sails.log.debug('Recieved error when authenticating via facebook ' + err)
          sails.log.error(err)
          return reject(err)
        }
        return resolve(true)
      })
    })
  },
  authenticateGoogle(req, res) {
    req.logOut() || req.logout()
    return new Promise(function (resolve, reject) {
      passport.authenticate('google', { scope: [ 'email', 'profile' ] })(req, res, function (err) {
        if (err) {
          sails.log.debug('Recieved error when authenticating via google ' + err)
          sails.log.error(err)
          return reject(err)
        }
        return resolve(true)
      })
    })
  },
  authenticateTwitter(req, res) {
    req.logOut() || req.logout()
    return new Promise(function (resolve, reject) {
      passport.authenticate('twitter')(req, res, function (err) {
        if (err) {
          sails.log.debug('Recieved error when authenticating via twitter ' + err)
          sails.log.error(err)
          return reject(err)
        }
        return resolve(true)
      })
    })
  }
}
