/**
 * AuthController
 * Created by Dale
 *
 * @description :: Server-side logic for managing authentication.
 */

const passport = require('passport')

module.exports = {

    /**
     * Authenticate users for local logins (see passport.js for more info)
     * 
     * @param {returnType} req - the request object to login via the local provider
     * @param {returnType} res - the response object
     */
    local: function(req, res) {
        if (req.user) res.redirect('/')

        sails.log.debug('local auth request: ');
        sails.log.debug(req.allParams());
        passport.authenticate('local', function(err, user, message) {
            new Promise(function(resolve, reject) {
                if (err || !user) {
                    sails.log.debug('Error authentication via passport');
                    sails.log.debug(err);
                    sails.log.debug(user);
                    sails.log.debug(message);
                    return resolve({ status: 500, error: err, errorMessage: message });
                } else {
                    req.login(user, function(err) {
                        sails.log.debug('logging user in');
                        if (err) {
                            sails.log.debug('Failed to log on user to req in controllers/authcontroller.js')
                            return resolve({ status: 500, error: err, errorMessage: err.message, messagelocal: 'failed to log on user to req in controllers/authcontroller.js' });
                        } else {
                            sails.log.debug('Succesfully logged on user via passport in controllers/authcontroller.js')
                            sails.log.debug('User logging in: ' + user);
                            return resolve({ status: 200, user: req.user });
                        }
                    });
                }
            }).then(function(result) {
                sails.log.debug(result);
                if (res.xhr) {
                    return res.json(result);
                } else {
                    return res.redirect('/');
                }
            });
        })(req, res);
    },
    /**
     * Generates an API token (a JSON web token that is signed using HMAC to ensure integrity, 
     * see services/ApiService.js for more info). 
     * 
     * @param {returnType} arg1 - what is is.
     * @param {returnType} arg2 - what it is.
     */
    generateApiToken: function(req, res) {
        async.asyncify(function() {
            ApiService.createApiToken(req, {
                id: req.user.id,
                permissions: ['all'],
                iat: Math.floor(new Date().getTime() / 1000) - 30,
                aud: 'SeatFilla',
                sub: 'SeatfillaApiToken'
            }, function(err, token) {
                if (err) {
                    sails.log.debug('Error generating API token, controllers/authcontroller.js')
                    return res.json({ error: err, errorMessage: err.message })
                } else {
                    ApiService.createApiUser(req.user, token).then(function(apiUser) {
                        return { message: 'Succesfully created API token, it will be validated shortly', token: token }
                    }).catch(function(err) {
                        sails.log.debug('Error creating ApiUser in controllers/authcontroller.js')
                        return { error: err, errorMessage: err.message }
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

    /**
     * Authenticates a request object via facebook.
     * 
     * @param {returnType} arg1 - the req object to authenticate via facebook..
     * @param {returnType} arg2 - the response object.
     */
    facebook: function(req, res) {
        if (req.user) return res.redrect('/')

        sails.log.debug('Made request to login via facebook')

        passport.authenticate('facebook', { scope: 'public_profile, email' })(req, res, function(err) {
            if (err) {
                sails.log.debug('Recieved error when authenticating via facebook ' + err);
            } else {

            }
        })
    },
    /**
     * The facebook callback used during authentication, used to pass the request back to the control of
     * our app
     * 
     * @param {returnType} arg1 - what is is.
     * @param {returnType} arg2 - what it is.
     */
    facebookCallback: function(req, res) {
        passport.authenticate('facebook', {
            successRedirect: '/auth/success',
            failureRedirect: '/user/login'
        })(req, res, function(err, user) {
            if (err) {
                sails.log.debug('Error in facebook callback ' + err)
                return res.badRequest({ error: err, user: user })
            } else {
                res.redirect('/auth/success');
            }
        })
    },
    /**
     * Authenticates a request via twitter. See config/passport.js for more information. 
     * 
     * @param {returnType} arg1 - what is is.
     * @param {returnType} arg2 - what it is.
     */
    twitter: function(req, res) {
        if (req.user) return res.redrect('/')

        sails.log.debug('Made request to login via twitter')

        passport.authenticate('twitter')(req, res, function(err) {
            if (err) {
                sails.log.debug('Recieved error when authenticating via twitter ' + err)
            }
        })
    },
    /**
     * The twitter callback used during authentication to return control to our application.
     * From here, we can redirect the users based on the result of authentication via the response object. 
     * 
     * @param {returnType} arg1 - what is is.
     * @param {returnType} arg2 - what it is.
     */
    twitterCallback: function(req, res) {
        passport.authenticate('twitter', {
            successRedirect: '/user/completeRegistration',
            failureRedirect: '/user/login'
        })(req, res, function(err, user) {
            if (err) {
                sails.log.debug('Error in twitter callback ' + err)
                return res.badRequest({ error: err, user: user })
            } else {
                res.redirect('/user/completeRegistration');
            }
        })
    },
    /**
     * Authenticates a request via google, see config/passport.js for more information. 
     * 
     * @param {returnType} arg1 - what is is.
     * @param {returnType} arg2 - what it is.
     */
    google: function(req, res) {
        if (req.user) return res.redrect('/')

        sails.log.debug('Made request to login via twitter')

        passport.authenticate('google')(req, res, function(err) {
            if (err) {
                sails.log.debug('Recieved error when authenticating via google ' + err)
            }
        });
    },
    /* 
     * The google callback used during authentication to return control of the request back to our application. 
     * Here we handle the response from google, and redirect the user to the appropriate web pages. For more information,
     * see config/passport.js.
     * 
     * @param {returnType} arg1 - what is is.
     * @param {returnType} arg2 - what it is.
     */
    googleCallback: function(req, res) {
        passport.authenticate('google', { failureRedirect: '/user/login' },
            function(req, res) {
                res.redirect('/auth/success');
            })
    },
    /**
     * Via some providers, users will be redirected to this page to show system status. 
     * 
     * @param {returnType} arg1 - what is is.
     * @param {returnType} arg2 - what it is.
     */
    success: function(req, res) {
        return res.ok({ user: req.user });
    },
    /**
     * Logs a user out  (this may be used to user controller,hmm)
     * 
     * @param {returnType} arg1 - what is is.
     * @param {returnType} arg2 - what it is.
     */
    logout: function(req, res) {
        if (!req.user) res.redirect('/');
        req.logout()
        req.session.destroy()
        res.redirect('/')
    }
}