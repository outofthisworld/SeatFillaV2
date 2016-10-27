/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * Only applies to HTTP requests (not WebSockets)
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.http.html
 */
const passport = require('passport')
var flash = require('connect-flash')

module.exports.http = {
  middleware: {
    passportInit: passport.initialize(),
    passportSession: passport.session(),
    passportSessionInit: (function () {
      /* 
          Handles the serialization and 
          deserialization proccess for session storage (keeps server memory low)
        */
      passport.serializeUser(function (user, done) {
        sails.log.debug('Serializing user: ' + user)
        done(null, user.id)
      })

      passport.deserializeUser(function (id, done) {
        User.findOne({ id: id })
          .populate('roles')
          .populate('userSettings')
          .populate('userLocations')
          .populate('notifications')
          .populate('systemNotificationUsers')
          .populate('addresses')
          .populate('flightRequests')
          .populate('bids')
          .populate('apiKeys')
          .populate('supportTickets').exec(function (err, user) {
          if (err) {
            sails.log.error(err)
            return Promise.reject(err)
          }

          UserProfile.findOrCreate({user: user.id })
            .then(function (userProfile) {
              if (!userProfile) {
                return Promise.reject(err)
              }else {
                sails.log.debug('Found user profile : ' + JSON.stringify(userProfile))

                if (!userProfile.description || userProfile.description.length < 5) {
                  sails.log.debug('Updating profile')
                  return UserProfile.update({id: userProfile.id}, {description: 'Welcome to seatfilla'})
                    .then(function (userProfile) {
                      sails.log.debug('Updated user profile')
                      user.userProfile = userProfile
                      return Promise.resolve()
                    })
                }else {
                  user.userProfile = userProfile
                  return Promise.resolve()
                }
              }
            }).then(function () {
            return UserSettings.findOrCreate({ user: user.id }, { user: user.id }, function (err, userSettings) {
              if (err) {
                sails.log.debug('Could not find or create user settings')
                sails.log.error(err)
                return Promise.reject(err)
              } else {
                sails.log.debug('Found user settings ' + JSON.stringify(userSettings))
                // Handle nested associations that waterline doesn't currently have support for.
                if (userSettings && userSettings.currentLocation &&
                  Number.isInteger(userSettings.currentLocation)) {
                  return UserLocation.findOne({ id: userSettings.currentLocation }).then(function (userLoc) {
                    user.userSettings = userSettings
                    user.userSettings.currentLocation = userLoc
                    return Promise.resolve()
                  }).catch(function (err) {
                    sails.log.error(err)
                    return Promise.reject(err)
                  })
                } else {
                  sails.log.debug('User settings were' + JSON.stringify(userSettings))
                  sails.log.debug('Current location was ' + userSettings.currentLocation)
                  return Promise.resolve()
                }
              }
            })
          }).then(function () {
            return new Promise(function (resolve, reject) {
              user.addresses.forEach(function (address, indx) {
                Country.findOne({alpha3Code: address.countryInfo }).then(function (country) {
                  user.addresses[indx].countryInfo = country
                }).catch(function (err) {
                  sails.log.error(err)
                  return reject(err)
                })
              })
              return resolve()
            })
          }).then(function () {
            sails.log.debug('Resolving user: ' + JSON.stringify(user))
            return Promise.resolve(done(null, user))
          }).catch(function (err) {
            sails.log.error(err)
            return Promise.reject(done(err, null))
          })
        })
      })
    })(),

    /***************************************************************************
     *                                                                          *
     * The order in which middleware should be run for HTTP request. (the Sails *
     * router is invoked by the "router" middleware below.)                     *
     *                                                                          *
     ***************************************************************************/

    order: [
      'startRequestTimer',
      'cookieParser',
      'session',
      'passportInit',
      'passportSession',
      'connectFlash',
      'requestLogger',
      'reqModifer',
      'resModifer',
      'bodyParser',
      'handleBodyParserError',
      'compress',
      'methodOverride',
      'poweredBy',
      '$custom',
      'router',
      'www',
      'favicon',
      '404',
      '500'
    ],
    connectFlash: flash(),
    reqModifer: function (req, res, next) {
      req.isPOST = function () {
        return req.method === 'POST'
      }
      req.isGET = function () {
        return req.method === 'GET'
      }
      req.isPUT = function () {
        return req.method === 'PUT'
      }
      req.isDELETE = function () {
        return req.method === 'DELETE'
      }
      req.setParam = function(paramName,paramValue){
          delete req.query[paramName];
          delete req.body[paramName];
          delete req.params[paramName];
          
          req.body[paramName] = paramValue
      }
      next()
    },
    resModifer: function (req, res, next) {
      next()
    },
    localePreference: function (req, res, next) {
      UserSettingsService.setUserLocalePreference(req, req.headers['Accept-Language'])
    },

    /****************************************************************************
     *                                                                           *
     * Example custom middleware; logs each request to the console.              *
     *                                                                           *
     ****************************************************************************/

    requestLogger: function (req, res, next) {
      console.log('Requested :: ', req.method, req.url)
      console.log('Headers: ' + JSON.stringify(req.headers))

      return next()
    }

    /***************************************************************************
     *                                                                          *
     * The body parser that will handle incoming multipart HTTP requests. By    *
     * default as of v0.10, Sails uses                                          *
     * [skipper](http://github.com/balderdashy/skipper). See                    *
     * http://www.senchalabs.org/connect/multipart.html for other options.      *
     *                                                                          *
     * Note that Sails uses an internal instance of Skipper by default; to      *
     * override it and specify more options, make sure to "npm install skipper" *
     * in your project first.  You can also specify a different body parser or  *
     * a custom function with req, res and next parameters (just like any other *
     * middleware function).                                                    *
     *                                                                          *
     ***************************************************************************/

    // bodyParser: require('skipper')({strict: true})

  },

  /***************************************************************************
   *                                                                          *
   * The number of seconds to cache flat files on disk being served by        *
   * Express static middleware (by default, these files are in `.tmp/public`) *
   *                                                                          *
   * The HTTP static cache is only active in a 'production' environment,      *
   * since that's the only time Express will cache flat-files.                *
   *                                                                          *
   ***************************************************************************/

// cache: 31557600000
}
