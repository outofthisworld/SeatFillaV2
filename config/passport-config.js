/* 
   Make any passport changes, or external client/consumer key changes from this
   configuration file. 
   
   Created by Dale
*/

module.exports.passport_config = {
    //Change this is the front end form name fields change.
    localStrategyFields:{
        usernameField:"email",
        passwordField:"password", 
        passReqToCallback: true },

    //Facebook fields (dales fb)
    facebookStrategyFields:{ 
        clientID: '294356564254458',
        clientSecret: '4c1ca548f206377818fe869fa057035a',
        callbackURL: "http://localhost:1337/auth/facebookCallback/",
        profileFields: ['id', 'emails', 'gender', 'link', 
        'locale', 'name', 'timezone', 'updated_time', 'verified','photos'],
        passReqToCallback: true
    },

    //Twitter fields (used twitter account associated with dale@farpoint.co.nz for keys)
    twitterStrategyFields :{
        consumerKey: 'yVTbxPx6FlasXEwwWw0owaAHw',
        consumerSecret: 'vZ8FQN4hcVcBXCmGWH9yxvtlqXAEJ9dGjoWqKDZWbcoKev73Pa',
        callbackURL: "http://localhost:1337/auth/twitterCallback/",
        passReqToCallback:true
    },

    //Google fields (used dale@farpoint.co.nz for creating API key)
    googleStrategyFields = {
        consumerKey: '998518772662-83bluipuml5m7n19tipu2i79qafpquc4.apps.googleusercontent.com',
        consumerSecret: 'xQdKMAMfHU4X-cgnMiXkCWvM',
        //AIzaSyA1pzn_Q_OxcgbLDmdwMoZc81aiKKVM2ZU
        callbackURL: "http://localhost:1337/auth/googleCallback/",
        passReqToCallback:true
   }
}