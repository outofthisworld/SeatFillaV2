module.exports = {
    findOneByUser(req, res) {
        sails.log.debug(res.locals)
        if(!req.xhr){
        return res.ok({
            UserProfile: req.options.userprofile,
        }, {
            title: req.options.userprofile.user.username + ' ' + req.__('UserProfile'),
        })
        }else{
           return res.ok({
            UserProfile: req.options.userprofile,
        }, {
            renderHtml:true,
        }) 
        }
    },
    uploadProfileImage(req, res) {
        return res.ok({
            UserProfile: req.options.userprofile
        }, {
            title: req.options.userprofile.user.username + ' ' + req.__('UserProfile')
        })
    },
    providerSection(req, res) {
        return res.ok({
            UserProfile: req.options.userprofile
        }, {
            title: req.options.userprofile.user.username + ' ' + req.__('UserProfile')
        })
    },
    flightScheduling(req, res) {
        return res.ok({
            UserProfile: req.options.userprofile
        }, {
            title: req.options.userprofile.user.username + ' ' + req.__('UserProfile')
        })
    },
    flight_group(req, res) {
        return res.ok({
            user: req.user
        }, {
            view: 'user-account-panel/change-details',
            title: req.__('FlightGroup')
        })
    },
    notifications(req,res){
        return res.ok({
            user:req.user
        },{

        })
    },
    flight_notifications(req, res) {
        return res.ok({
            user: req.user
        }, {
            view: 'user-account-panel/flight-notifications',
            title: req.__('FlightNotifications')
        })
    },
    my_flight_circle(req, res) {
        return res.ok({
            user: req.user
        }, {
            view: 'user-account-panel/my-flight-circle',
            title: req.__('MyFlightCircle')
        })
    },
    recently_searched(req, res) {
        return res.ok({
            user: req.user
        }, {
            view: 'user-account-panel/recently-searched',
            title: req.__('RecentlySearched')
        })
    },


    /*
    is own profile policy.
    passportAuthPolicy
    */
    api(req, res) {
        ApiService.findApiTokensForUser({
            id: req.user.id
        }).then(function(tokens) {
            return res.ok({
                UserProfile: req.options.userprofile,
                user: req.user,
                tokens: tokens
            }, {
                view: 'userprofile/api',
                renderHtml: true
            })
        }).catch(function(err) {
            return res.notFound(err);
        })
    }
}