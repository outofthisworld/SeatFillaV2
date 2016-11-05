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

    'get /': 'HomeController.index',
    'get /login': 'HomeController.login',

 
    'get /Provider/*':{
        locals:{
            layout: 'layouts/provider-layout.ejs'
        }
    },
    

    'get /UserProfile/:username':{
        controller:'UserProfileController',
        action:'findOneByUser',
        policy:'viewProfilePolicy',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    /**********/

    /****** FLIGHT GROUP PATHS ******/

    /*
        Is own profile policy
        -create,destroy,update
    */

    'get /ajax/templates/*.html':{
        policy:'acceptPolicy'
    },

    'get /UserProfile/:username/FlightGroup/Create':{
        controller:'FlightGroupController',
        action:'create',
        policy:'viewProfilePolicy',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'get /UserProfile/:username/FlightGroup/:id/Destroy':{
        controller:'FlightGroupController',
        action:'destroy',
        policy:'viewProfilePolicy',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'get /UserProfile/:username/FlightGroup/:id/Update':{
        controller:'FlightGroupController',
        action:'update',
        policy:'viewProfilePolicy',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'get /UserProfile/:username/FlightGroup/:id':{
        controller:'FlightGroupController',
        action:'findOne',
        policy:'viewProfilePolicy',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'get /UserProfile/:username/FlightGroups/':{
        controller:'FlightGroupController',
        action:'findByUser',
        policy:'viewProfilePolicy',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    /* ********************* */

    /* FLIGHT REQUEST PATHS */
    'get /UserProfile/FlightRequest/Create/':{
        controller:'FlightRequestController',
        action:'create',
        policy:'viewProfilePolicy',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'get /UserProfile/:username/FlightRequest/Create/':{
        controller:'FlightRequestController',
        action:'create',
        policy:'viewProfilePolicy',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'get /UserProfile/FlightReqest/:id/Destroy':{
        controller:'FlightRequestController',
        action:'destroy',
        policy:'viewProfilePolicy',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'get /UserProfile/FlightRequest/:id/Update':{
        controller:'FlightRequestController',
        action:'update',
        policy:'viewProfilePolicy',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'get /UserProfile/:username/FlightRequest/:id':{
        controller:'FlightRequestController',
        action:'findOne',
        policy:'viewProfilePolicy',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'get /UserProfile/:username/FlightRequest/':{
        controller:'FlightRequestController',
        action:'findByUser',
        policy:'viewProfilePolicy',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    /* ********************* */
    'get /UserProfile/:username/update':{
        controller:'UserController',
        action:'update', 
        policy:'viewProfilePolicy',
        locals:{
            layout:'layouts/profile-layout'
        }
    },

    'get /UserProfile/:username/uploadProfileImage':{
        controller:'UserProfileController',
        action:'uploadProfileImage',
        policy:'viewProfilePolicy',
        locals:{
            layout:'layouts/profile-layout'
        }
    },

    'get /UserProfile/:username/UpdateSettings':{
        controller:'UserSettingsController',
        action:'update', //isOwnProfile
        policy:'viewProfilePolicy',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'get /UserProfile/:username/provider':{
        controller:'UserProfileController',
        action:'providerSection', //isOwnProfile
        policy:'viewProfilePolicy',
        locals:{
            layout:'layouts/profile-layout'
        }
    },

    /*** MISC ****/
    'get /User/create':{
        controller:'HomeController',
        action:'register'
    },

    'get /UserProfile/:username/Hotel/Create':{
        controller:'HotelController',
        action:'create',
        policy:'viewProfilePolicy',
        locals:{
            layout:'layouts/profile-layout'
        }
    },
    'post /UserProfile/:username/Hotel/Create':{
        controller:'HotelController',
        action:'create',
    }


    
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