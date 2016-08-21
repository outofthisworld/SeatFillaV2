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
      clientID: '294356564254458',
      clientSecret: '4c1ca548f206377818fe869fa057035a',
      callbackURL: "http://localhost:1337/auth/facebookCallback/",
      profileFields: ['id', 'emails', 'gender', 'link', 
      'locale', 'name', 'timezone', 'updated_time', 'verified','photos'],
      passReqToCallback: true
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

//Local stratergy for logging in
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

//Facebook stratergy for logging in
const facebookStrategy = function(req,accessToken,refreshToken,profile,done){
    sails.log.debug(profile);
    sails.log.debug(req);
     User.findOrCreate(
         { id: profile.id, provider:'facebook' }, 
         {
             id: profile.id,
             provider: 'facebook',
             firstName: profile.name.givenName,
             middleName: profile.name.middleName,
             lastName: profile.name.familyName,
             email: profile.emails[0].value
          },
    function(err, user) {
         if (err || !user) { return done(err || new Error('Could not create user'), null); }

         req.login(user,function(err){
             if(err){
                sails.log.debug(err);
             }else{
                sails.log.debug('Succefully logged in request');
             }
         });

         req.session.fb = {}
         req.session.fb.accessToken = accessToken;
         req.session.fb.refreshToken = refreshToken;

         return done(null, user);
    });
}

const twitterStrategy = function(){

}

const googleStrategy = function(){

}


//Local auth
passport.use(new LocalStrategy(localStrategyFields, localStrategy));
passport.use(new FacebookStrategy(facebookStrategyFields, facebookStrategy));
