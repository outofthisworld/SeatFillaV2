/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const passport = require('passport')

module.exports = {
  // Authenticate users for local logins (see passport.js)
  local: function (req, res) {
    if(req.user) return req.ok({error: "Already logged in"});

    async.asyncify(function () {
      passport.authenticate('local', function (err, user, message) {
        if (err || !user) return {error: err, message: message}

        req.login(user, function (err) {
          if (err) {
            sails.log.debug('Failed to log on user to req in controllers/authcontroller.js')

            return {error: err,message: 'failed to log on user to req in controllers/authcontroller.js'}
          }

          sails.log.debug('Succesfully logged on user via passport in controllers/authcontroller.js')

          return {user: req.user}
        // return res.ok({user:req.user}, { view:'/Dashboard', title:'Dashboard'})
        })
      })(req, res)
    })((result) => {
      if (result.error) {
        return res.negotiate(result)
      }else {
        return res.send({message: message, user: user})
      }
    })
  },
  // Generates an API token (a JSON web token that is signed using HMAC to ensure integrity). 
  generateApiToken: function (req, res) {
    async.asyncify(function () {
      jwtService.createApiToken(req, {
        id: req.user.id,
        permissions: ['all'],
        iat: Math.floor(Date.now() / 1000) - 30,
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
      return res.json(result)
    })
  },
  facebook: function (req,res) {
      if(req.user) return req.ok({error: "Already logged in"});

      sails.log.debug('Made request to login via facebook');

      passport.authenticate('facebook', {scope: 'public_profile, email'})(req, res, function(err){
          sails.log.debug('Recieved error when authenticating via facebook');
      });
  },
  facebookCallback: function (req,res) {
      passport.authenticate('facebook',{
        successRedirect: '/',
        failureRedirect: '/user/login'
        })(req,res,function(err,user) {
          sails.log.debug('Error in facebook callback ' + err);
          return res.json({error:err,user:user});  
      });
  }
}
