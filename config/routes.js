/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

    /***************************************************************************
     *                                                                          *
     * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
     * etc. depending on your default view engine) your home page.              *
     *                                                                          *
     * (Alternatively, remove this and add an `index.html` file in your         *
     * `assets` directory)                                                      *
     *                                                                          *
     ***************************************************************************/

    /*
        Home controller routes
    */
    'get /': {
        controller:'HomeController',
        action:'index',
        locals:{
            layout:'layout'
        }
    },
    'get /login': {
        controller:'HomeController',
        action:'login',
        locals:{
            layout:'layout'
        }
    },
    'get /verification/email':{
        controller:'HomeController',
        action:'resendVerificationEmail',
        locals:{
            layout:'layout'
        }
    },
    'get /password/reset':{
        controller:'HomeController',
        action:'resetPassword',
        locals:{
            layout:'layout'
        }
    },
    /* End home controller routes */

    /* Provider routes */
    'get /Provider/':{
        controller:'ProviderController',
        action:'index',
        locals:{
            layout: 'layouts/provider-layout.ejs'
        }
    },
    'get /Provider/webhook/create':{
        controller:'WebhookController',
        action:'create',
        locals:{
            layout: 'layouts/provider-layout.ejs'
        }
    },
    'post /Provider/webhook/create':{
        controller:'WebhookController',
        action:'create',
        locals:{
            layout:'layouts/profile-layout'
        },
        redirectSuccess:'/provider/webhook/createSuccess',
        redirectFailiure:'/provider/webhook/create'
    },
    'get /Provider/webhook/createSuccess':{
        policy:'hasSuccess',
        locals:{
            layout: 'layouts/provider-layout.ejs'
        },
        view:'webhook/createSuccess',
        successExpiredRedirect:'/Provider/'
    },
    'get /Provider/FlightRequests':{
        controller:'FlightRequestController',
        action:'find',
        locals:{
            layout: 'layouts/provider-layout.ejs'
        },
    },
    'get Provider/FlightOffers':{
        controller:'FlightOfferController',
        action:'findByApiUser',
        locals:{
            layout: 'layouts/provider-layout.ejs'
        }
    },
    'get Provider/FlightBids':{
        controller:'BidController',
        action:'findByApiUser,',
        locals:{
            layout: 'layouts/provider-layout.ejs'
        }
    },
    'get /Provider/webhook/sendWebhookVerification':{
        controller:'WebhookController',
        action:'sendWebhookVerification',
        locals:{
            layout: 'layouts/provider-layout.ejs'
        }
    },
    'get /Provider/webhook/verifyWebhook':{
        controller:'WebhookController',
        action:'verifyWebhook',
        locals:{
            layout: 'layouts/provider-layout.ejs'
        }
    },
    /**********/
    'get /UserProfile/:username':{
        controller:'UserProfileController',
        action:'findOneByUser',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'get /UserProfile/:username/update':{
        controller:'UserController',
        action:'update', 
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'post /UserProfile/:username/update':{
        controller:'UserController',
        action:'update', 
        locals:{
            layout:'layouts/profile-layout'
        },
        redirectFailiure:'/userprofile/:username/update',
        redirectSuccess:'/userprofile/:username/update'
    },
    'get /UserProfile/:username/uploadProfileImage':{
        controller:'UserProfileController',
        action:'uploadProfileImage',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'get /UserProfile/:username/UpdateSettings':{
        controller:'UserSettingsController',
        action:'update', //isOwnProfile
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    '/UserProfile/:username/feed':{
        controller:'FeedController',
        action:'index',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'get /UserProfile/:username/api':{
        controller:'UserProfileController',
        action:'api', //isOwnProfile
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'get /UserProfile/:username/notifications':{
        controller:'NotificationsController',
        action:'findByUser',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'get /UserProfile/:username/flightScheduling':{
        controller:'UserProfileController',
        action:'flightScheduling',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'get /UserProfile/:username/provider':{
        controller:'UserProfileController',
        action:'providerSection', //isOwnProfile
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'get /UserProfile/:username/Hotel/Create':{
        controller:'HotelController',
        action:'create',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'post /UserProfile/:username/Hotel/Create':{
        controller:'HotelController',
        action:'create',
    },
     /****** FLIGHT GROUP PATHS ******/

    /*
        Is own profile policy
        -create,destroy,update
    */

    'get /UserProfile/:username/FlightGroup/Create':{
        controller:'FlightGroupController',
        action:'create',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'get /UserProfile/:username/FlightGroup/:id/Destroy':{
        controller:'FlightGroupController',
        action:'destroy',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'get /UserProfile/:username/FlightGroup/:id/Update':{
        controller:'FlightGroupController',
        action:'update',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'get /UserProfile/:username/FlightGroup/:id':{
        controller:'FlightGroupController',
        action:'findOne',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'get /UserProfile/:username/FlightGroups':{
        controller:'FlightGroupController',
        action:'findByUser',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    /* ********************* */

    
    'get /UserProfile/:username/FlightRequest/Create':{
        controller:'FlightRequest',
        action:'create',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'get /UserProfile/:username/FlightReqest/:id/Destroy*':{
        controller:'FlightRequestController',
        action:'destroy',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'get /UserProfile/:username/FlightRequest/:id/Update':{
        controller:'FlightRequestController',
        action:'update',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'get /UserProfile/:username/FlightRequest/:id':{
        controller:'FlightRequestController',
        action:'findOne',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'get /UserProfile/:username/FlightRequest':{
        controller:'FlightRequestController',
        action:'findByUser',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    /* ********************* */

    /*** MISC ****/

    /*Home controller*/
    'get /User/create':{
        controller:'HomeController',
        action:'register'
    },

    



    'get /ajax/templates/*.html':{
        policy:'acceptPolicy'
    },
   
    /***************************************************************************
     *                                                                          *
     * Custom routes here...                                                    *
     *                                                                          *
     * If a request to a URL doesn't match any of the custom routes above, it   *
     * is matched against Sails route blueprints. See `config/blueprints.js`    *
     * for configuration options and examples.                                  *
     *                                                                          *
     ***************************************************************************/

};