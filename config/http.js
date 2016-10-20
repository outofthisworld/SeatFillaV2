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
module.exports.http = {

  /****************************************************************************
   *                                                                           *
   * Express middleware to use for every Sails request. To add custom          *
   * middleware to the mix, add a function to the middleware config object and *
   * add its key to the "order" array. The $custom key is reserved for         *
   * backwards-compatibility with Sails v0.9.x apps that use the               *
   * `customMiddleware` config option.                                         *
   *                                                                           *
   ****************************************************************************/

  middleware: {
    passportInit: passport.initialize(),
    passportSession: passport.session(),
    passportSessionInit: function () {
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
          .populate('images')
          .populate('addresses')
          .populate('flightRequests')
          .populate('bids')
          .populate('apiKeys')
          .populate('supportTickets').then(function (user) {
          if (!user.userSettings || user.userSettings.length < 1) {
            UserSettings.findOrCreate({ user: user.id }, { user: user.id }, function (err, userSettings) {
              if (err) {
                sails.log.debug('Could not find or create user settings')
                sails.log.error(err)
                Promise.reject(err);
              } else {
                sails.log.debug('Found user settings ' + JSON.stringify(userSettings))
                // Handle nested associations that waterline doesn't currently have support for.
                if (userSettings && userSettings.currentLocation &&
                  Number.isInteger(userSettings.currentLocation)) {
                  UserLocation.findOne({ id: userSettings.currentLocation }).exec(function (err, userLoc) {
                    if (err) {
                      sails.log.debug('Unable to execute query find user location even though current location is set..')
                      sails.log.error(err)
                      return Promise.reject(err)
                    } else {
                      user.userSettings = userSettings
                      user.userSettings.currentLocation = userLoc
                      return Promise.resolve(user)
                    }
                  })
                } else {
                  sails.log.debug('User settings were' + JSON.stringify(userSettings))
                  sails.log.debug('Current location was ' + userSettings.currentLocation)
                  return Promise.resolve(user)
                }
              }
            })
          }
          return Promise.resolve(user);
        }).then(function (user) { 
            return new Promise(function(resolve,reject){
                user.addresses.forEach(function(address, indx){
                    Country.findOne({alpha3Code: address.countryInfo }).then(function(country){
                        user.addresses[indx].countryInfo = country;
                    }).catch(function(err){
                        sails.log.error(err);
                        return reject(err);
                    })
                })
                return resolve(user);
            })
        }).then(function(user){
            return done(null,user);
        }).catch(function (err) {
            sails.log.error(err);
            return done(err,null);
        })
      })
    }(),

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
      next()
    },
    resModifer: function (req, res, next) {
      next()
    },

    /****************************************************************************
     *                                                                           *
     * Example custom middleware; logs each request to the console.              *
     *                                                                           *
     ****************************************************************************/

    requestLogger: function (req, res, next) {
      console.log('Requested :: ', req.method, req.url)

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
