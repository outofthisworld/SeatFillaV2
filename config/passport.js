/*
    Contains all the logic for logging in via remote websites using SSO,
    current supports facebook,twitter,google and local authentication.

    Created by Dale.
*/

//Here we will define new passport stratergies so we 
// can login using fb, twitter ect.
const passport = require('passport'), 
LocalStrategy = require('passport-local').Strategy,
FacebookStrategy = require('passport-facebook').Strategy,
TwitterStrategy = require('passport-twitter').Strategy,
GoogleStrategy = require('passport-google-oauth').OAuthStrategy;


/*
    Configuration (Check passport_config.js, contains API keys and callback URL's ect.')
*/

//Change this is the front end form name fields change.
const localStrategyFields = sails.config.passport_config.localStrategyFields;

//Facebook SSO fields 
const facebookStrategyFields = sails.config.passport_config.facebookStrategyFields;

//Twitter SSO fields
const twitterStrategyFields = sails.config.passport_config.twitterStrategyFields;

//Google SSO fields
const googleStrategyFields =  sails.config.passport_config.googleStrategyFields;


/* 
   Handles the serialization and 
   deserialization proccess for session storage (keeps server memory low)
 */
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findOne({ id: id }).populate('roles').exec(function (err, user) {
        done(err, user);
    });
});

//Local stratergy for logging in
const localStrategy = function(req, email, password, done){
       User.findOne().where({or: [{email: email}, {username:req.allParams().username}]})
       .populate('roles').exec(function(err, user){
           if(err){
               done(err);
           }else if(!user){
               done(new Error('Invalid username'));
           }else if(!user.verifyPassword(password)){
               done(new Error('Invalid password'));
           }else{ 
            return done(null, user, { message:"Succesfully logged in" });
           }
       });
}

//Generic statergy for external auths (facebook,twitter,google) emits code duplication.
const genericStratergy = function(req,accessToken,refreshToken,profile,done){
    sails.log.debug(profile);
    UserService.createExternalUser(req,accessToken,refreshToken,profile).then(function(user){
        sails.log.debug('Succesfully created new external user' + user);
        return done();
    }).catch(function(err){
        sails.log.debug('Error when creating external user ' + err);
        return done(err);
    });
}

//Local auth
passport.use(new LocalStrategy(localStrategyFields, localStrategy));
//Facebook auth
passport.use(new FacebookStrategy(facebookStrategyFields, genericStratergy));
//Twitter auth
passport.use(new TwitterStrategy(twitterStrategyFields, genericStratergy));
//Google auth
passport.use(new GoogleStrategy(googleStrategyFields,genericStratergy));