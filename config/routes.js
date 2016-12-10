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
    'get /*':{
        policy:'allPolicy'
    },
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
    'get /contactus':{
       controller:'HomeController',
       action:'contactus',
        locals:{
            layout:'layout'
        }
    },
    'get /aboutus':{
      controller:'HomeController',
      action:'aboutus',
      locals:{
          layout:'layout'
      }
    },
    /* End home controller routes */


    /* Provider routes */
    'get /Provider*':{
        policy:'providerPolicy',
    },
    'get /Provider/':{
        controller:'ProviderController',
        action:'index',
        locals:{
            layout: 'layouts/provider-layout.ejs'
        }
    },
    'get /Provider/index':{
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
            layout: 'layouts/provider-layout.ejs',
            view:'provider/flightRequests.ejs'
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
    'get /Provider/webhook/':{
        controller:'WebhookController',
        action:'find',
        locals:{
            layout: 'layouts/provider-layout.ejs'
        }
    },
      'get /Provider/webhook/find':{
        controller:'WebhookController',
        action:'find',
        locals:{
            layout: 'layouts/provider-layout.ejs'
        }
    },
    'get /Provider/webhook/:id/sendWebhookVerification':{
        controller:'WebhookController',
        action:'sendWebhookVerification',
        locals:{
            layout: 'layouts/provider-layout.ejs'
        }
    },
    'get /Provider/payment':{
        controller:'ProviderController',
        action:'paymentMethod',
        locals:{
            layout: 'layouts/provider-layout.ejs'
        }
    },
    'get /Provider/webhook/:id/verifyWebhook':{
        controller:'WebhookController',
        action:'verifyWebhook',
        locals:{
            layout: 'layouts/provider-layout.ejs'
        }
    },
    'POST /Provider/webhook/verifyWebhook':{
        controller:'WebhookController',
        action:'verifyWebhook',
        locals:{
            layout: 'layouts/provider-layout.ejs'
        }
    },
    'POST /Provider/webhook/:id/verifyWebhook':{
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
    'get /api/':{
        controller:'ApiController',
        action:'index',
        locals:{
            layout:'layout'
        }
    },
    'get /api/index':{
        controller:'ApiController',
        action:'index',
        locals:{
            layout:'layout'
        }
    },
    'get /api/documentation':{
        controller:'ApiController',
        action:'documentation',
        locals:{
            layout:'layout'
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
        controller:'ApiController',
        action:'index', //isOwnProfile
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'get /UserProfile/:username/api/documentation':{
        controller:'ApiController',
        action:'documentation', //isOwnProfile
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
    'get /UserProfile/:username/findOne':{
       controller:'UserProfileController',
       action:'findOne', //isOwnProfile
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
    'get /flightoffer':{
        locals:{
            layout:'layouts/search-layout'
        }
    },
    'get /flightoffer/index':{
        locals:{
            layout:'layouts/search-layout'
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
    'post /UserProfile/:username/FlightRequest/Create':{
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

    /* Api routes */
    'get /apiv1*':{
        policy:'apiPolicy'
    },
    'get /apiv1/flightrequest':{
        controller:'FlightRequestController',
        action:'find',
    },
    'post /apiv1/flightrequest':{
        controller:'FlightRequestController',
        action:'create',
    },
    'get /apiv1/flightrequest/:id':{
        controller:'FlightRequestController',
        action:'findOne',
    },
    'post /apiv1/flightrequest/:id/accept':{
        controller:'FlightRequestController',
        action:'accept',
    },
    'patch /apiv1/flightrequest/:id':{
        controller:'FlightRequestController',
        action:'update',
    },
    'delete /apiv1/flightrequest/:id':{
        controller:'FlightRequestController',
        action:'destroy',
    },
    'get /apiv1/flightoffer':{
        controller:'FlightOfferController',
        action:'find',
    },
    'post /apiv1/flightoffer':{
        controller:'FlightOfferController',
        action:'create',
    },
    'get /apiv1/flightoffer/:id':{
        controller:'FlightOfferController',
        action:'findOne'
    },
    'patch /apiv1/flightoffer/:id':{
        controller:'FlightOfferController',
        action:'update'
    },
    'delete /apiv1/flightoffer/:id':{
        controller:'FlightOfferController',
        action:'destroy'
    },
    'get /apiv1/hoteloffer':{
        controller:'FlightOfferController',
        action:'find',
    },
    'post /apiv1/hoteloffer':{
        controller:'FlightOfferController',
        action:'create',
    },
    'get /apiv1/hoteloffer/:id':{
        controller:'FlightOfferController',
        action:'findOne'
    },
    'patch /apiv1/hoteloffer/:id':{
        controller:'FlightOfferController',
        action:'update'
    },
    'delete /apiv1/hoteloffer/:id':{
        controller:'FlightOfferController',
        action:'destroy'
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
