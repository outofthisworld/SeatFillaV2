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
const xmlparser = require('express-xml-bodyparser')
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
        return User.findOne({ id: id })
          .populate('roles')
          .populate('userSettings')
          .populate('userLocations')
          .populate('notifications')
          .populate('addresses')
          .populate('flightRequests')
          .populate('bids')
          .populate('apiKeys')
          .populate('supportTickets').exec(function (err, user) {
          if (err) {
            sails.log.error(err)
            return Promise.reject(err)
          }

          return UserProfile.findOrCreate({user: user.id })
            .then(function (userProfile) {
              if (!userProfile) {
                return Promise.reject(err)
              }else {

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
                // Handle nested associations that waterline doesn't currently have support for.
                if (userSettings && userSettings.currentLocation &&
                  Number.isInteger(userSettings.currentLocation)) {
                  return UserLocation.findOne({ id: userSettings.currentLocation }).then(function (userLoc) {
                    user.userSettings = userSettings
                    user.userSettings.currentLocation = userLoc
                    return Promise.resolve()
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

                if(indx == user.addresses.length-1){
                    return resolve()
                }
              })
            })
          }).then(function () {
            //sails.log.debug('Resolving user: ' + JSON.stringify(user))
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
      'xmlParser',
      'handleBodyParserError',
      'compress',
      'methodOverride',
      'poweredBySeatfilla',
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

      req.wantsXML = req.headers['accept'] == 'application/xml' || req.headers['accept'] == 'text/xml';

      req.setParam = function(paramName,paramValue){
          req.body[paramName] = paramValue;
          req.query[paramName] = paramValue
          req.params[paramName] = paramValue;
      }

      req.deleteParam = function(paramName){
         if(req.allParams()[paramName]){
          delete req.body[paramName];
          delete req.query[paramName];
          delete req.params[paramName];
         }
      }
     return  next()
    },
    resModifer: function (req, res, next) {
      return next()
    },
    poweredBySeatfilla:function(req,res,next){
      res.set({'X-Powered-By':'Seatfilla <seatfilla.com>'})
      return next();
    },
    xmlParser:function(req,res,next){
      if (req.headers && (req.headers['content-type'] == 'text/xml' || req.headers['content-type'] == 'application/xml')) {
        return xmlparser(req, res, next);
      }
      return next();
    },
    localePreference: function (req, res, next) {
      UserSettingsService.setUserLocalePreference(req, req.headers['Accept-Language'])
    },

    requestLogger: function (req, res, next) {
     // console.log('Requested :: ', req.method, req.url)
      //console.log('Headers: ' + JSON.stringify(req.headers))

      return next()
    }

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
