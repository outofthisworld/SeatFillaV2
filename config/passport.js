//Here we will define new passport stratergies so we 
// can login using fb, twitter ect.
const passport = require('passport'), 
LocalStrategy = require('passport-local').Strategy,
FacebookStrategy = require('passport-facebook').Strategy;

//Change this is the front end form name fields change.
const localStrategyFields = {
     usernameField:"email",
     passwordField:"password", 
     passReqToCallback: true }


const facebookStrategyFields = { 
      //clientID: FACEBOOK_APP_ID,
      //clientSecret: FACEBOOK_APP_SECRET,
      callbackURL: "http://www.seatfilla.com/auth/facebook/"
}

/* 
   Handles the serialization and 
   deserialization proccess (keeps server memory low)
 */
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findOne({ id: id }).populate('roles').exec(function (err, user) {
        done(err, user);
    });
});

const localStrategy = function(req, email, password, done){
       User.findOne().where({or: [{email: email}, {username:req.body.username}]})
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

const facebookStrategy = function(accessToken,refreshToken,profile,done){
     User.findOrCreate(
         { id: profile.id, provider:'facebook' }, 
         {
             id: profile.id,
             provider: 'facebook',
             firstName: profile.name.givenName,
             middleName: profile.name.middleName,
             lastName: profile.name.familyName,
             email: (function(){
                 profile.emails[0].value;
                 sails.log(profile.emails);
             })(),
     
          },
    function(err, user) {
      if (err || !user) { return done(err || new Error('Could not create user'), null); }
      done(null, user);
    });
}

const twitterStrategy = function(){

}

const googleStrategy = function(){

}


//Local auth
passport.use(new LocalStrategy(localStrategyFields, localStrategy));
//passport.use(new FacebookStrategy(facebookStrategyFields, facebookStrategy));
