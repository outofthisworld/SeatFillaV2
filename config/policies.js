module.exports.policies = {
  UserController:{
    '*':true
  },
  AuthController:{
    '*':false,
    'generateApiToken':['passportAuth'],
    'local':true,
    'facebook':true,
    'instagram':true,
    'google':true,
    'googleCallback':true,
    'facebookCallback':true,
    'instagramCallback':true,
  },
  VerifyController:{
    '*':false,
    'email':true
  },
  FlightOfferController:{
    '*':false,
    'create':['apiPolicy'],
    'delete':['apiPolicy'],
    'update':['apiPolicy'],
    'find':['apiPolicy'] //Remove this later
  },
  //The following need updating, but are all access for now.
  RequestController:{
    '*':true
  },
  BidController:{
    '*':true
  },
  ApiUsers:{
    '*':true
  }

};
