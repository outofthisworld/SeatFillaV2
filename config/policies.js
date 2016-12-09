/*
  Here we set up any policies on our controllers,
  Policies act as preconditions, things that must be true in order to
  proceed to a controller action. Because sails services all http methods
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

  11. whiteListedDomainPolicy: ensures that the request originated from a whitelisted domain as specified in config/domain-whitelist.js

  12. ipBlacklistPolicy: ensures that the request is not madde from an I.P address that has been blacklisted.

  Created by Dale.

  This file will be continously updated.. and is not yet complete.
*/

module.exports.policies = {
    UserController: {
        '*':true,
        'find': [],
        'findOne': [],
        'create': ['postPolicy', 'createAccountPolicy', 'notLoggedInPolicy',],
        'index': ['getPolicy','passportAuth'],
        'update':['passportAuth','viewProfilePolicy','isOwnProfilePolicy']//Return user profile
    },
    AuthController: {
        '*': false,
        'generateApiToken': ['passportAuth'],
        'removeApiToken': ['passportAuth'],
        'removeAllApiTokens': ['passportAuth'],
        'local': 'notLoggedInPolicy',
        'facebook': true,
        'instagram': true,
        'google': true,
        'googleCallback': 'notLoggedInPolicy',
        'facebookCallback': 'notLoggedInPolicy',
        'instagramCallback':'notLoggedInPolicy',
        'twitter': true,
        'twitterCallback': 'notLoggedInPolicy',
    },
    HomeController:{
         '*':true,
        'login':['notLoggedInPolicy'],
        'register':['notLoggedInPolicy']
    },
    ProviderController:{
        'login':['notLoggedInPolicy'],
        'authenticate':['notLoggedInPolicy']
    },
    VerifyController: {
        'email': ['getPolicy']
    },
    FlightOfferController: {
        '*': false,
        'find':true,
        'index':true
    },
    FlightRequestController: {
        'create':['passportAuth','viewProfilePolicy','isOwnProfilePolicy']
    },
    BidController: {
        '*': true
    },
    ApiUsers: {
        '*': true
    },
    Maps:{
        '*':true
    },
    SubscriptionController:{
        '*':false,
        'subscribeToUserSocketService':['passportAuth']
    },
    HotelController:{
        '*':true,
        'create':['passportAuth', 'viewProfilePolicy','isOwnProfilePolicy']
    },
    ListingsController:{
        '*':true
    },
    NotificationsController:{
        '*':true,
    },
    FeedController:{
        index:'viewProfilePolicy'
    },
    UserProfileCommentController:{
        'create':['passportAuth','setUserPolicy'],
        'add':['passportAuth','setUserPolicy']
    },
    HotelSaleController:{
        'placebid':['passportAuth']
    },
    UserProfileController:{
        '*':'viewProfilePolicy',
        'api':['passportAuth','viewProfilePolicy','isOwnProfilePolicy'],
        'providerSection':['passportAuth','viewProfilePolicy','isOwnProfilePolicy'],
        'findOneByUser':['viewProfilePolicy'],
        'flightScheduling':['passportAuth','viewProfilePolicy','isOwnProfilePolicy'],
        'find':false,
        'findOne':true
    },
    UserSettings:{
        '*':false,
        'update':['viewProfilePolicy','isOwnProfilePolicy']
    }
};
