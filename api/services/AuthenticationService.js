const passport = require('passport')

module.exports = {
  authenticateLocal(req, res, object) {
    return new Promise(function (resolve, reject) {
      (passport.authenticate('local', function (err, user) {
        if (err || !user) {
          sails.log.debug('Status in local auth was ' + err.status);
          sails.log.debug('Error authentication via passport')
          sails.log.debug(err)
          sails.log.debug(user)
          return resolve({ status:err.status, error: err, errorMessage: err.message })
        } else {
          req.login(user, function (err) {
            sails.log.debug('logging user in')
            if (err) {
              sails.log.debug('Failed to log on user to req in controllers/authcontroller.js')
              sails.log.error(err);
              return resolve({ status:sails.config.passport.errorCodes().ErrorUnknown, error: err, errorMessage: err.message, 
                  messagelocal: 'failed to log on user to req in controllers/authcontroller.js' })
            } else {
              sails.log.debug('Succesfully logged on user via passport in controllers/authcontroller.js')
              sails.log.debug('User logging in: ' + user)
              return resolve({ status:sails.config.passport.errorCodes().Success, user: req.user })
            }
          })
        }
      }))(req, res)
    }).catch(function (err) {
      sails.log.error(err)
      return resolve({ status:sails.config.passport.errorCodes().ErrorUnknown, error: err, errorMessage: err.message })
    })
  },
  authenticateFacebook(req, res, redirectObj) {
    return new Promise(function (resolve, reject) {
      if (redirectObj && redirectObj.failiureRedirect) {
        req.session.failiureRedirect = redirectObj.failiureRedirect
      }
      if (redirectObj && redirectObj.successRedirect) {
        req.session.successRedirect = redirectObj.successRedirect
      }
      passport.authenticate('facebook', { scope: 'public_profile, email' })(req, res, function (err) {
        if (err) {
          sails.log.error(err)
          return reject(err)
        }
        return resolve(true)
      })
    })
  },
  authenticateGoogle(req, res, redirectObj) {
   
  },
  authenticateTwitter(req, res, redirectObj) {
       return new Promise(function (resolve, reject) {
            if (redirectObj && redirectObj.failiureRedirect) {
                req.session.failiureRedirect = redirectObj.failiureRedirect
            }
            if (redirectObj && redirectObj.successRedirect) {
                req.session.successRedirect = redirectObj.successRedirect
            }
            passport.authenticate('twitter')(req, res, function(err) {
            if (err) {
                return reject(err);
            }
            return resolve(true);
        })
    });
  }
}
