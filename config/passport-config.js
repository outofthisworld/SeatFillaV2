
module.exports.passport_config = {
    //Change this is the front end form name fields change.
    localStrategyFields:{
        usernameField:"email",
        passwordField:"password", 
        passReqToCallback: true },

    //Facebook fields
    facebookStrategyFields:{ 
        clientID: '294356564254458',
        clientSecret: '4c1ca548f206377818fe869fa057035a',
        callbackURL: "http://localhost:1337/auth/facebookCallback/",
        profileFields: ['id', 'emails', 'gender', 'link', 
        'locale', 'name', 'timezone', 'updated_time', 'verified','photos'],
        passReqToCallback: true
    },

    //Twitter fields
    twitterStrategyFields :{
        consumerKey: TWITTER_CONSUMER_KEY,
        consumerSecret: TWITTER_CONSUMER_SECRET,
        callbackURL: "http://www.example.com/auth/twitter/callback",
        passReqToCallback:true
    },

    googleStrategyFields = {
        consumerKey: GOOGLE_CONSUMER_KEY,
        consumerSecret: GOOGLE_CONSUMER_SECRET,
        callbackURL: "http://www.example.com/auth/google/callback",
        passReqToCallback:true
   }
}