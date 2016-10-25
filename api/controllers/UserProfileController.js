module.exports = {
  index(req, res) {
    return res.ok({
        UserProfile: req.options.userprofile
      }, {
        view: 'user-account-panel/my-account',
        layout: 'layouts/my-account-layout',
        title: req.__('MyAccount')
      })
  },
  flight_group(req, res) {
    return res.ok({
      user: req.user
    }, {
      view: 'user-account-panel/change-details',
      layout: 'layouts/my-account-layout',
      title: req.__('FlightGroup')
    })
  },
  user_notifications(req, res) {},
  system_notifications(req, res) {},
  flight_notifications(req, res) {
    return res.ok({
      user: req.user
    }, {
      view: 'user-account-panel/flight-notifications',
      layout: 'layouts/my-account-layout',
      title: req.__('FlightNotifications')
    })
  },
  my_flight_circle(req, res) {
    return res.ok({
      user: req.user
    }, {
      view: 'user-account-panel/my-flight-circle',
      layout: 'layouts/my-account-layout',
      title: req.__('MyFlightCircle')
    })
  },
  recently_searched(req, res) {
    return res.ok({
      user: req.user
    }, {
      view: 'user-account-panel/recently-searched',
      layout: 'layouts/my-account-layout',
      title: req.__('RecentlySearched')
    })
  },
  api(req, res) {
    ApiService.findApiTokensForUser({ id: req.user.id }).then(function (tokens) {
      return res.ok({ user: req.user, tokens: tokens }, {
        view: 'user-account-panel/api',
        layout: 'layouts/my-account-layout'
      })
    })
  }
}
