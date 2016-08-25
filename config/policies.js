/*
  Here we set up any policies on our controllers,
  Policies act as preconditions, things that must be true in order to
  proceed to a controller action.Because sails services all http methods
  (GET,PUT,DELETE,POST...ect) for each and every controller method/function/action/behaviour,
  it is our responsibility to make sure that each controller action is being invoked via the
  right method to avoid any security implications. 

  The policies at this present time include:
  
  1. adminPolicy: Confirms that the requester is an admin and that they are logged in.
  
  2. apiPolicy: Confirms that the indivual making the request has made the request using a 
  valid API key and secret.
  
  3. createAccountPolicy: Ensures that any post request coming in does not contain a user id, 
  or boolean values indicating if the email is verified.

  4. emailConfirmedPolicy: Ensures that the user is logged in and they have a verified email address.

  4. deletePolicy: Ensures that the request was made via the DELETE method.

  5. getPolicy: Ensures that the request was made via the GET method.

  6. postPolicy: Ensures that the request was made via the POST method.

  7. putPolicy: Ensures that the request was made via the PUT method.

  8. passportAuth: Ensures that this user is authenticated and logged in.

  9. moderatorPolicy: ensures that the user is logged in and that they are a moderator.

  10. notLoggedInPolcy: ensures that the user is not logged in.
*/

module.exports.policies = {
  UserController:{
    'find':['getPolicy','adminPolicy'],
    'findOne':['getPolicy','adminPolicy'],
    'create':['postPolicy','createAccountPolicy','notLoggedInPolicy'],
    'myaccount':['getPolicy','passportAuth'],
    'login':['getPolicy']
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
    'twitter':true,
    'twitterCallback':true,
  },
  VerifyController:{
    '*':false,
    'email':['getPolicy']
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
