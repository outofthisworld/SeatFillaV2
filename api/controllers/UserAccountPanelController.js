module.exports = {
    //GET [return the my account page]
    my_account: function(req, res) {
        return res.ok({ user: req.user }, {
            layout: 'layouts/my-account-layout',
            view: 'user-account-panel/my-account',
            title: req.__('MyAccount')
        });
    },
    //[Get the change details page]
    change_details: function(req, res) {
        return res.ok({
            user: req.user
        }, {
            layout: 'layouts/my-account-layout',
            view: 'user-account-panel/change-details',
            title: req.__('ChangeDetails')
        });
    },
    flight_group(req, res) {
        return res.ok({
            user: req.user
        }, {
            layout: 'layouts/my-account-layout',
            view: 'user-account-panel/change-details',
            title: req.__('FlightGroup')
        });
    },
    user_notifications(req, res) {

    },
    system_notifications(req, res) {

    },
    flight_notifications(req, res) {
        return res.ok({
            user: req.user
        }, {
            layout: 'layouts/my-account-layout',
            view: 'user-account-panel/flight-notifications',
            title: req.__('FlightNotifications')
        });
    },
    flight_requests(req, res) {
        return res.ok({
            user: req.user
        }, {
            layout: 'layouts/my-account-layout',
            view: 'user-account-panel/flight-request',
            title: req.__('FlightRequest')
        });
    },
    my_flight_circle(req, res) {
        return res.ok({
            user: req.user
        }, {
            layout: 'layouts/my-account-layout',
            view: 'user-account-panel/my-flight-circle',
            title: req.__('MyFlightCircle')
        });
    },
    recently_searched(req, res) {
        return res.ok({
            user: req.user
        }, {
            layout: 'layouts/my-account-layout',
            view: 'user-account-panel/recently-searched',
            title: req.__('RecentlySearched')
        });
    },
    api(req, res) {
        ApiService.findApiTokensForUser({ id: req.user.id }).then(function(tokens) {
            return res.ok({ user: req.user, tokens: tokens }, {
                view: 'user-account-panel/api',
                layout: 'layouts/my-account-layout'
            })
        });
    }
}