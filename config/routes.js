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

    'get /User/*':{
        locals:{
            layout: 'layouts/my-account-layout.ejs'
        }
    },
    'get /Provider/*':{
        locals:{
            layout: 'layouts/provider-layout.ejs'
        }
    },
    
    /***** USER PROFILE PATHS *****/
     'get /User/:username':{
        controller:'UserProfileController',
        action:'index',
        policy:'viewProfilePolicy'
    },
    'get /UserProfile/:username':{
        controller:'UserProfileController',
        action:'index',
        policy:'viewProfilePolicy'
    },
    /**********/

    /****** FLIGHT GROUP PATHS ******/

    /*
        Is own profile policy
        -create,destroy,update

        Is user link policy
        -findByUser,
        Is member policy
        -findOne

        view profile policy
    */

    'get /UserProfile/:username/FlightGroup/Create':{
        controller:'FlightGroupController',
        action:'create',
        locals:{
            layout:'layouts/my-account-layout'
        }
    },
    'get /UserProfile/:username/FlightGroup/:id/Destroy':{
        controller:'FlightGroupController',
        action:'destroy',
        locals:{
            layout:'layouts/my-account-layout'
        }
    },
    'get /UserProfile/:username/FlightGroup/:id/Update':{
        controller:'FlightGroupController',
        action:'update',
        locals:{
            layout:'layouts/my-account-layout'
        }
    },
    'get /UserProfile/:username/FlightGroup/:id':{
        controller:'FlightGroupController',
        action:'findOne',
        locals:{
            layout:'layouts/my-account-layout'
        }
    },
    'get /UserProfile/:username/FlightGroups/':{
        controller:'FlightGroupController',
        action:'findByUser',
        locals:{
            layout:'layouts/my-account-layout'
        }
    },
    /* ********************* */

    /* FLIGHT REQUEST PATHS */
    'get /UserProfile/FlightRequest/Create/':{
        controller:'FlightRequestController',
        action:'create',
        locals:{
            layout:'layouts/my-account-layout'
        }
    },
    'get /UserProfile/:username/FlightRequest/Create/':{
        controller:'FlightRequestController',
        action:'create',
        locals:{
            layout:'layouts/my-account-layout'
        }
    },
    'get /UserProfile/FlightReqest/:id/Destroy':{
        controller:'FlightRequestController',
        action:'destroy',
        locals:{
            layout:'layouts/my-account-layout'
        }
    },
    'get /UserProfile/FlightRequest/:id/Update':{
        controller:'FlightRequestController',
        action:'update',
        locals:{
            layout:'layouts/my-account-layout'
        }
    },
    'get /UserProfile/:username/FlightRequest/:id':{
        controller:'FlightRequestController',
        action:'findOne',
        locals:{
            layout:'layouts/my-account-layout'
        }
    },
    'get /UserProfile/:username/FlightRequest/':{
        controller:'FlightRequestController',
        action:'findByUser',
        locals:{
            layout:'layouts/my-account-layout'
        }
    },
    /* ********************* */


    /*** MISC ****/


    
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