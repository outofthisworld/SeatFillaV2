module.exports = {
  index(req, res) {
    return res.ok({
      apiUser: ProviderService.getApiUser(req),
      user: req.user,
      })
  },
  paymentMethod(req,res){
      sails.log.debug('In payment method')

      if(req.isGET()){
          sails.log.debug('returning view, get req')
         return res.ok();
      }
      const paypalEmail = req.param('paypalEmail');
      sails.log.debug(req.allParams())
      
      if(!paypalEmail){
          req.flash('danger','No email specified');
          return res.redirect('back')
      }

      const apiUser = ProviderService.getApiUser(req);
      ApiUsers.update({apiToken:apiUser.apiToken},{paypalEmail})
      .then(function(updated){
        apiUser.paypalEmail = updated.paypalEmail;
        return res.redirect('provider/index')
      }).catch(function(err){
          return res.serverError(err);
      })
  },
  view_flight_requests(req, res) {
    return res.ok({
      user: req.user
    }, {
      view: 'flightrequest/find',
      layout: 'layouts/provider-layout'
    })
  },
  create_flight_offers(req, res) {
    return res.ok({
      user: req.user
    }, {
      view: 'flightoffer/create',
      layout: 'layouts/provider-layout'
    })
  },
  view_flight_offers(req, res) {
    return res.ok({
      user: req.user
    }, {
      view: 'flightoffer/find',
      layout: 'layouts/provider-layout'
    })
  },
  create_advertisement(req, res) {
    return res.ok({
      user: req.user
    }, {
      view: 'advertisments/create',
      layout: 'layouts/provider-layout'
    })
  },
  login(req, res) {
    return res.ok({redirectSuccess: '/provider/index'}, {
      view: 'home/login'
    })
  },
  authenticate(req, res) {
    if (!req.param('apiKey') || !req.param('apiSecret')) res.redirect('/')

    AuthenticationService.authenticateLocal(req, res)
      .then(function (result) {
        if (result.status == sails.config.passport.errorCodes().Success) {
          sails.log.debug('Attempting to login as provider')
          return ProviderService.login(req, req.param('apiKey'), req.param('apiSecret')).then(function (result) {
            sails.log.debug('Result logging in via provider was : ' + result)
            return Promise.resolve(result)
          }).catch(function (err) {
            sails.log.debug('Error logging in via provider')
            sails.log.error(err)
            return Promise.reject(err)
          })
        } else {
          return Promise.reject(result)
        }
      }).then(function (result) {
      sails.log.debug('Succesfully authenticated and logged in via provider, result was ' +
        JSON.stringify(result))

      if (req.wantsJSON) {
        return res.json(200, result)
      } else {
        return res.redirect(req.param('redirectSuccess') || '/provider/index')
      }
    }).catch(function (err) {
      sails.log.debug('Error in ProviderController.js/authenticate')
      sails.log.debug('Error was ' + JSON.stringify(err))
      sails.log.error(err)

      req.flash('toaster-warning', 'Error logging in: invalid credentials')
      req.flash('info', 'Error logging in : invalid credentials')
      if (req.wantsJSON) {
        return res.json(200, err)
      } else {
        res.redirect(req.param('redirectFailiure') || '/provider/login')
      }
    })
  }
}
