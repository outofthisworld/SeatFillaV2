module.exports = {
  index(req, res) {
    return Promise.all([
      ApiRequests.find(
        {
          apiUser: ProviderService.getApiKey(req)
        }
      ).populate('apiRoute')
    ]).then(function (apiRequests) {
      return res.ok({ user: req.user, apiRequests}, {
        view: 'provider-dashboard/index',
      })
    }).catch(function (err) {
      return res.badRequest(err)
    })
  },
  view_flight_requests(req,res){
      return res.ok({ user: req.user}, {
        view: 'flightrequest/find',
      })
  },
  create_flight_offers(req,res){
    return res.ok({ user: req.user }, {
        view: 'flightoffer/create',
    })
  },
  view_flight_offers(req,res){
    return res.ok({ user: req.user}, {
        view: 'flightoffer/find',
    })
  },
  create_advertisement(req,res){
     return res.ok({ user: req.user}, {
        view: 'advertisments/create',
    })
  },
  login(req, res) {
    return res.ok({}, {
      view: 'provider-dashboard/login'
    })
  },
  authenticate(req, res) {
    if (!req.param('apiKey') || !req.param('apiSecret')) res.redirect('/')

    AuthenticationService.authenticateLocal(req, res)
      .then(function (result) {
        if (result.status == sails.config.passport.errorCodes().Success) {
          sails.log.debug('Attempting to login as provider')
          return new Promise(function (resolve, reject) {
            ProviderService.login(req, req.param('apiKey'), req.param('apiSecret')).then(function (result) {
              sails.log.debug('Result logging in via provider was : ' + result)
              return resolve(result)
            }).catch(function (err) {
              sails.log.debug('Error logging in via provider')
              sails.log.error(err)
              return reject(err)
            })
          })
        }else {
          return Promise.reject(result)
        }
      }).then(function (result) {
      req.flash('toaster-success', 'Succesfully logged into the provider panel')

      sails.log.debug('Succesfully authenticated and logged in via provider, result was '
        + JSON.stringify(result))

      if (req.wantsJSON) {
        return res.json(200, result)
      }else {
        return res.redirect(req.param('redirectSuccess') || '/provider/index')
      }
    }).catch(function (err) {
      sails.log.debug('Error in ProviderController.js/authenticate')
      sails.log.debug('Error was ' + err)
      sails.log.error(err)

      req.flash('toaster-warning', 'Error logging in : ' + err.message)
      req.flash('info', 'Error logging in : ' + err.message)

      if (req.wantsJSON) {
        return res.json(200, err)
      }else {
        res.redirect(req.param('redirectFailiure') || '/provider/login')
      }
    })
  }
}
