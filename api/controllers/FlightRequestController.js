const _create = require('../out/create')

module.exports = {
  create(req, res) {
    if (req.isGET()) {
      return res.ok({
        user: req.user,
        UserProfile: req.options.userprofile
      }, {
        renderHtml: true
      })
    }

    const obj = _.clone(req.allParams())
    obj.user = req.user.id
    obj.status = 'AwaitingProviderAccept'
    delete obj.id
    sails.log.debug(req.allParams())
    async.auto({
      //Convert everything to a base currency, makes it
      //easier later,rather than trying to convert serveral disparate currencies to a single currency.
      convert_currency:function(callback){

        //If we are already in the correct currency just return, value will remain the same.
        if(obj.currency == 'USD'){
          return callback(null,{maximumPayment:obj.maximumPayment,conversionRate:1,currency:'USD'})
        }

        LookupService.fixer_io_get_exchange_rates(obj.currency)
        .then(function(results){

          if(!('USD' in results.rates)){
            return callback(new Error('Unsupported currency'),null);
          }

          var conversionRate = results.rates.USD;

          try{
            conversionRate = parseFloat(conversionRate);
          }catch(err){
            return callback(err,null);
          }

          var maximumPayment = obj.maximumPayment;

          try{
            maximumPayment = parseFloat(maximumPayment);
          }catch(err){
            return callback(new Error('Error parsing maximum payment amount'),null);
          }

          return callback(null,{maximumPayment,conversionRate,currency:'USD'});
        })
      },
      create_flight_request:['convert_currency',function(callback,results){
        obj.currency = results.convert_currency.currency;
        obj.maximumPayment = results.convert_currency.maximumPayment * results.convert_currency.conversionRate;
        FlightRequest.create(obj).then(function (created) {
          sails.log.debug(created);
          User.publishAdd(created.id,'flightRequests',created);
          FlightRequest.publishCreate(created)
          return callback(null,created)
        }).catch(function (err) {
          return callback(err,null);
        })
      }]
    },function(err,results){
      if(err){
        return res.negotiate(err)
      }else{
        return res.ok(results.create_flight_request);
      }
    })
  },
  accept: function (req, res) {
    const flightRequestId = req.param('id')

    const errors = []

    var apiUser
    try {
      apiUser = ProviderService.getApiUser(req);

      if(!(ProviderService.hasPermission('accept_request_permission',req))){
        errors.push('Unauthrozized to perform this action, api token must have correct permission');
      }
    } catch(err) {
      errors.push(err.message)
    }

    sails.log.debug(req.allParams())
    sails.log.debug('Found api user: ')
    sails.log.debug(apiUser)

    if(!flightRequestId){
      errors.push('Invalid flight request id')
    }

    if (!req.param('hours'))
      errors.push('Missing param hours')

    var hours
    try {
      hours = parseInt(req.param('hours'))
      if (!hours || isNan(hours) || hours < 12) errors.push('Invalid hours value specified')
    } catch(err) {
      errors.push('Invalid hours value specified')
    }

    var amount;
    try{
      amount = parseFloat(req.param('amount'))
      if(!amount || isNan(amount)) errors.push('Invalid amount specified')
    }catch(err){
      errors.push('Invalid amount specified');
    }

    if (errors.length) {
      return res.badRequest({status: 400,error: new Error('Validation Error'),errorMessages: errors})
    }

    async.waterfall([
      function locateFlightRequest (callback) {
        FlightRequest.findOne({id: flightRequestId})
          .populate('user')
          .then(function (flightRequest) {
            if (!flightRequest) return callback(new Error('Invalid flight request id'), null)
            return callback(null, flightRequest)
          }).catch(callback)
      },
      function checkAccepted (flightRequest, callback) {
        AcceptedFlightRequest.findOne({flightRequest: flightRequestId})
          .exec(function (err, acceptedFlightRequest) {
            if (err) return callback(err, null)

            if (acceptedFlightRequest) {
              return callback(new Error('This flight request has alredy been accepted'), null)
            }

            return callback(null, flightRequest)
          })
      },
      function convert_currency(flightRequest,callback){
        LookupService.fixer_io_get_exchange_rates(req.param('currency')).then(function(response){
            if(!('USD' in response.rates)){
              return callback(new Error('Unsupported currency'),null);
            }
            try{
              var conversionRate = parseFloat(response.rates.USD);
              if(!conversionRate || isNaN(conversionRate)){
                return callback(new Error('Invalid conversion rate'),null);
              }
              sails.log.debug('Before currency ' + amount + ' ' + req.param('currency'))
              amount = amount * conversionRate;
              sails.log.debug('After currency: ' + amount + ' USD')
              return callback(null,flightRequest);
            }catch(err){
              return callback(err,null);
            }
        }).catch(callback)
      },
      function checkAmount(flightRequest,callback){
        if(amount <= parseFloat(flightRequest.maximumPayment)){
            return callback(null,flightRequest)
        }else{
            return callback(new Error('Invalid flight accept amount, must be below users maximum payment'),null);
        }
      },
      function acceptFlightRequest (flightRequest, callback) {
        // Use server date to stop inconsistencies from client side dates
        // we can then either: provide a select
        // which has `days` `hours` `weeks` and converts them into an hours format
        // OR alternatively provide a date time field and subtract the current datetime
        // client side, convert it to hours and send it through to this controller action.
        const today = new Date()
        today.setHours(today.getHours() + hours)
        AcceptedFlightRequest.create(
          {
            flightRequest: flightRequest.id,
            validUntil: today.toISOString(),
            apiUser: ProviderService.getApiUser(req).apiToken,
            amount,
            currency:'USD'
          }
        ).then(function (acceptedFlightRequest) {
          if (!acceptedFlightRequest) callback(new Error('Invalid state'))
          else {
            FlightRequest.update({id: flightRequest.id}, {status: 'AwaitingUserApproval'})
              .exec(function (err,updated) {
                if (err || !updated.length) {
                  AcceptedFlightRequest.destroy({id: acceptedFlightRequest.id}).exec(function (error, des) {
                    if (error) {
                      sails.log.debug('critical error')
                    }
                    return callback(err, null)
                  })
                }
                FlightRequest.publishUpdate(updated[0].id,updated[0]);
                ApiUsers.publishAdd(ProviderService.getApiUser(req).apiToken, 'acceptedFlightRequests', acceptedFlightRequest)
                AcceptedFlightRequest.publishCreate(acceptedFlightRequest)
                return callback(null, {flightRequest,acceptedFlightRequest})
              })
          }
        }).catch(callback)
      },
      function sendUserEmail (flightRequest, callback) {
        EmailService.sendEmailAsync(sails.config.email.messageTemplates.flightRequestAccepted(flightRequest))
          .then(function (info) {
            sails.log.debug(info)
            return callback(null, flightRequest)
          }).catch(callback)
      }
    ], function (err, results) {
      sails.log.debug(results)
      if (err) {
        sails.log.error(err);
        return res.badRequest({error: err.message,errorMessages: [err.message],status: 400})
      }else {
        return res.ok({status: 200,message: 'succesfully accepted flight request',result: results.acceptFlightRequest})
      }
    })
  },
  find(req, res) {
    if (req.method == 'GET' && !(req.wantsJSON)) {
      sails.log.debug('finding flight request, returning res.ok with view')
      return res.ok({apiUser: ProviderService.getApiUser(req)}, {view: 'provider/flightRequests',layout: 'layouts/provider-layout'})
    }

    var obj = {}

    if (req.param('where'))
      obj = JSON.parse(req.param('where'))

    const queryObj = {where: obj,limit: req.param('limit'),skip: req.param('skip'),sort: req.param('sort')}
    sails.log.debug(queryObj)
    FlightRequest.find(queryObj)
      .then(function (flightRequests) {
        sails.log.debug(flightRequests)
        if (req.isSocket) {
          FlightRequest.watch(req)
          FlightRequest.subscribe(req, _.map(flightRequests, function (fr) {return fr.id}))
        }
        return res.ok(flightRequests)
      }).catch(function (err) {
      return res.badRequest(err)
    })
  },
  destroy(req, res) {
    const errors = []

    if (!req.param('id')) errors.push('Missing param:id')

    if (errors.length) {
      return res.badRequest({error: new Error('Validation Error'),errorMessages: errors})
    }

    FlightRequest.destroy({user: req.user.id,id: req.param('id')})
      .then(function (destroyed) {
        FlightRequest.publishDestroy(destroyed)
        return res.ok(destroyed)
      }).catch(function (err) {
      return res.negotiate(err)
    })
  },
  update(req, res) {
    const errors = []

    if (!req.param('id')) errors.push('Missing param:id')

    if (errors.length) {
      return res.badRequest({error: new Error('Validation Error'),errorMessages: errors})
    }

    const obj = _.clone(req.allParams())
    obj.user = req.user.id

    FlightRequest.update({user: req.user.id,id: req.param('id')}, obj)
      .then(function (updated) {
        FlightRequest.publishUpdate(updated)
        return res.ok(updated)
      }).catch(function (err) {
      return res.negotiate(err)
    })
  },
  findByUser(req, res) {
    if (!req.param('username')) return res.notFound()

    FlightRequest.find({
      user: req.param('username')
    }).then(function (FlightRequest) {
      return res.ok({
      FlightRequest})
    })
  }
}
