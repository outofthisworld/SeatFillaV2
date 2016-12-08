const _create = require('../out/create')

module.exports = {
  index(req,res){
    return res.ok({},{layout:'layouts/search-layout'})
  },
  update(req,res){
    var apiUser;
    const errors = []

    try{
      apiUser = ProviderService.getApiUser(req);
    }catch(err){
      sails.log.error(err)
      errors.push(err.errorMessage);
    }

    if(!req.param('id')) errors.push('Missing parameter: id')

    if(errors.length) return res.badRequest({error:new Error('Validation Error'),errorMessages:errors})

    FlightOffer.findOne({apiUser:apiUser.apiToken,id:req.param('id')})
    .then(function(flightOffer){
      FlightOffer.subscribe(req,flightOffer);
      return res.ok(flightOffer)
    }).catch(function(err){
      return res.serverError(err);
    })
  },
  create(req,res){
    if(req.isGET()){
      return res.ok();
    }

    const errors = []
    var apiUser;
    try{
      apiUser = ProviderService.getApiUser(req);
    }catch(err){
      sails.log.error(err)
      errors.push(err.message);
    }

    if(!req.param('id')) errors.push('Missing param: id');

    if(errors.length){
      return res.badRequest({status:400,error:new Error('Validation error'),errorMessages:errors});
    }

    const obj = _.clone(req.allParams())
    obj.ip = req.ip;
    obj.apiUser = apiUser.apiToken;
    FlightOffer.create(obj)
    .then(function(created){
      FlightOffer.publishCreate(created);
      return res.ok(created);
    }).catch(function(err){
      return res.serverError(err);
    })
  },
  destroy(req,res){
    var apiUser;
    const errors = []

    try{
      apiUser = ProviderService.getApiUser(req);
    }catch(err){
      sails.log.error(err)
      errors.push(err.errorMessage);
    }

    if(!req.param('id')) errors.push('Missing parameter: id')

    if(errors.length) return res.badRequest({error:new Error('Validation Error'),errorMessages:errors})

    FlightOffer.destroy({apiUser:apiUser.apiToken,id:req.param('id')})
    .then(function(destroyed){
      FlightOffer.publishDestroy(destroyed);
      return res.ok(destroyed)
    }).catch(function(err){
      return res.serverError(err);
    })
  }
}
