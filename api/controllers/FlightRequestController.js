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

    const obj = _.clone(req.allParams());
    obj.user = req.user.id;
    delete obj.id;

    FlightRequest.create(obj).then(function(created){
        FlightRequest.publishCreate(created)
        return res.ok(created);
    }).catch(function(err){
        return res.negotiate(err);
    })
  },
  accept: function (req, res) {
    const flightRequestId = req.param('id')

    const errors = []
    var apiUser;
    try{
        apiUser = ProviderService.getApiUser(req);
    }catch(err){
        errors.push(err.message);
    }

    if (!req.param('hours'))
      errors.push('Missing param hours')

    var hours
    try {
      hours = parseInt(req.param('hours'))
      if (hours < 12) errors.push('Invalid hours value specified')
    } catch(err) {
      errors.push('Invalid hours value specified')
    }

    if (errors.length) {
      return res.ok(400, {error: new Error('Validation Error'),errorMessages:errors})
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
      function checkAccepted(flightRequest,callback){
          AcceptedFlightRequest.find({flightRequest:flightRequest.id})
          .exec(function(err,flightRequest){
              if(err) return callback(err,null);

              if(flightRequest){
                  return callback(new Error('This flight request has alredy been accepted'),null);
              }

              return callback(null,flightRequest);
          })
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
          { flightRequest: flightRequest.id },
          {
            flightRequest: flightRequest.id,
            validUntil: today.toISOString(),
            apiUser: apiUser.apiToken
          }
        ).populate('apiUser').then(function (acceptedFlightRequest) {
          if (!acceptedFlightRequest) callback(new Error('Invalid state'))
          else return callback(null, {flightRequest,acceptedFlightRequest})
        }).catch(callback)
      },
      function sendUserEmail (flightRequests, callback) {
        EmailService.sendEmailAsync(sails.config.email.messageTemplates.flightRequestAccepted(flightRequests))
          .then(function (info) {
            callback(null, Object.extend(flightRequests, info))
          }).catch(callback)
      }
    ], function (err, results) {
      if (err) {
        return res.ok(400, err)
      }else {
        return res.ok(results)
      }
    })
  },
  destroy(req,res){
      const errors = [];

     if(!req.param('id')) errors.push('Missing param:id')

     if(errors.length){
         return res.badRequest({error:new Error('Validation Error'),errorMessages:errors})
     }

     FlightRequest.destroy({user:req.user.id,id:req.param('id')})
     .then(function(destroyed){
         FlightRequest.publishDestroy(destroyed);
         return res.ok(destroyed)
     }).catch(function(err){
         return res.negotiate(err);
     })
  },
  update(req,res){
      const errors = [];

     if(!req.param('id')) errors.push('Missing param:id')

     if(errors.length){
         return res.badRequest({error:new Error('Validation Error'),errorMessages:errors})
     }

     const obj = _.clone(req.allParams());
     obj.user = req.user.id;

    FlightRequest.update({user:req.user.id,id:req.param('id')},obj)
     .then(function(updated){
         FlightRequest.publishUpdate(updated);
         return res.ok(updated)
     }).catch(function(err){
         return res.negotiate(err);
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
