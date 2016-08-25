/**
 * AuthController
 * Created by Dale
 *
 * @description :: Server-side logic for managing auths
 */

const passport = require('passport')

module.exports = {
  // Authenticate users for local logins (see passport.js)
  local: function (req, res) {
    async.asyncify(function () {
      passport.authenticate('local', function (err, user, message) {
        if (err || !user) return {error: err, message: error.message}

        req.login(user, function (err) {
          if (err) {
            sails.log.debug('Failed to log on user to req in controllers/authcontroller.js')

            return {error: err, message: err.message, messagelocal: 'failed to log on user to req in controllers/authcontroller.js'}
          }

          sails.log.debug('Succesfully logged on user via passport in controllers/authcontroller.js')

          return {user: req.user}
        })
      })(req, res)
    })((result) => {
      if (result.error) {
        return res.json(result)
      }else {
        return res.json(result)
      }
    })
  },
  // Generates an API token (a JSON web token that is signed using HMAC to ensure integrity). 
  generateApiToken: function (req, res) {
    async.asyncify(function () {
      ApiService.createApiToken(req, {
        id: req.user.id,
        permissions: ['all'],
        iat: Math.floor(new Date().getTime() / 1000) - 30,
        aud: 'SeatFilla',
        sub: 'SeatfillaApiToken'
      }, function (err, token) {
        if (err) {
          sails.log.debug('Error generating API token, controllers/authcontroller.js')
          return res.json({error: err,errorMessage: err.message})
        }else {
          ApiUsers.create({apiToken: token, user: req.user.id}).exec(function (err, record) {
            if (err) {
              sails.log.debug('Error creating ApiUser in controllers/authcontroller.js')
              return {error: err,errorMessage: err.message}
            }
            return {message: 'Succesfully created API token, it will be validated shortly', token: token}
          })
        }
      })
    })((result) => {
      NotificationService.sendDedicatedNotificationAsync(req)({
              title: 'Api token has been succesfully generated! ',
              message: 'Your seatfilla API token has been succesfully generated, it will be verified shortly.!'
      });
      return res.json(result)
    })
  },
  facebook: function (req, res) {
    if (req.user) return res.redrect('/')

    sails.log.debug('Made request to login via facebook')

    passport.authenticate('facebook', {scope: 'public_profile, email'})(req, res, function (err) {
      if(err){
      sails.log.debug('Recieved error when authenticating via facebook ' + err);
      }else{
        
      }
    })
  },
  facebookCallback: function (req, res) {
    passport.authenticate('facebook', {
      successRedirect: '/auth/success',
      failureRedirect: '/user/login'
    })(req, res, function (err, user) {
      if(err){
         sails.log.debug('Error in facebook callback ' + err)
         return res.badRequest({error: err,user: user})
      }else{
         res.redirect('/auth/success');
      }
    })
  },
  twitter: function (req, res) {
     if (req.user) return res.redrect('/')

     sails.log.debug('Made request to login via twitter')

     passport.authenticate('twitter')(req, res, function (err) {
        if(err){
           sails.log.debug('Recieved error when authenticating via twitter ' + err)
        }
    })
  },
  twitterCallback: function (req, res) {
    passport.authenticate('twitter', {
      successRedirect: '/user/completeRegistration',
      failureRedirect: '/user/login'
    })(req, res, function (err, user) {
      if(err){
         sails.log.debug('Error in twitter callback ' + err)
         return res.badRequest({error: err,user: user})
      }else{
         res.redirect('/user/completeRegistration');
      }
    })
  },
  google: function (req, res) {
     if (req.user) return res.redrect('/')

     sails.log.debug('Made request to login via twitter')

     passport.authenticate('google')(req, res, function (err) {
        if(err){
           sails.log.debug('Recieved error when authenticating via google ' + err)
        }
     });
  },
  googleCallback: function (req, res) {
    passport.authenticate('google', { failureRedirect: '/user/login' },
    function(req, res) {
      res.redirect('/auth/success');
    })
  },
  success:function(req,res){
    return res.ok({user:req.user});
  },
  logout: function (req, res) {
    req.logout()
    req.session.destroy()
    res.redirect('/')
  }
}
