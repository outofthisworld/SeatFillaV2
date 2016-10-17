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
const passport = require('passport');
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
        passportSessionInit: function() {
            /* 
                Handles the serialization and 
                deserialization proccess for session storage (keeps server memory low)
              */
            passport.serializeUser(function(user, done) {
                sails.log.debug('Serializing user: ' + user);
                done(null, user.id)
            })

            passport.deserializeUser(function(id, done) {
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
                    .populate('supportTickets')
                    .exec(function(err, user) {
                        if (err) {
                            sails.log.debug('Could not find and de-serialize user with id passed in via passport... session user will not be populated.');
                            sails.log.error(err);
                        } else {
                            UserSettings.findOrCreate({ user: user.id }, { user: user.id }, function(err, user) {
                                if (err) {
                                    sails.log.debug('Could not find or create user settings');
                                    sails.log.error(err);
                                } else {
                                    //Handle nested associations that waterline doesn't currently have support for.
                                    if (user.userSettings.currentLocation) {
                                        UserLocation.findOne({ id: user.userSettings.currentLocation }).exec(function(err, userLoc) {
                                            if (err) {
                                                sails.log.debug('Unable to execute query find user location even though current location is set..');
                                                sails.log.error(err);
                                                done(err, user);
                                            } else {
                                                user.userSettings.currentLocation = userLoc;
                                                done(err, user);
                                            }
                                        })
                                    } else {
                                        done(err, user)
                                    }
                                }
                            });
                        }
                    });
            });
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
            'paramParser',
            'handleBodyParserError',
            'compress',
            'methodOverride',
            'poweredBy',
            '$custom',
            'router',
            'www',
            'favicon',
            '404',
            '500',
        ],
        reqModifer: function(req, res, next) {
            req.isPOST = function() {
                return req.method === "POST";
            }
            req.isGET = function() {
                return req.method === "GET";
            }
            req.isPUT = function() {
                return req.method === "PUT";
            }
            req.isDELETE = function() {
                return req.method === "DELETE";
            }
            next();
        },
        paramParser:function(req,res,next){
            const path = req.path.toLowerCase();
            sails.log.debug('Recieved request to path ' + path);
            if(path.indexOf('create') !== -1 || 
                path.indexOf('find') !== -1){
                   sails.log.debug(req.params);
                   const reqParams = req.params;
                   sails.log.debug('Recieved params in request to path : ' + path + ': ' + JSON.stringify(reqParams))
                   for(k in reqParams){
                         try{
                            const m = parseInt(reqParams[k]); 
                            if(!isNaN(m)){
                                sails.log.debug('Changing key ' + k + ' into integer ');
                                reqParams[k] = m;
                            }else{
                                sails.log.debug('Key ' + k + ' was not parsed as a number');
                            }
                        }catch(err){}
                   }
                }
           next();
        },
        resModifer: function(req, res, next) {
            next();
        },

        /****************************************************************************
         *                                                                           *
         * Example custom middleware; logs each request to the console.              *
         *                                                                           *
         ****************************************************************************/

        requestLogger: function(req, res, next) {
            console.log("Requested :: ", req.method, req.url);
            return next();
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
};