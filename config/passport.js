/*
    Contains all the logic for logging in via remote websites using SSO,
    current supports facebook,twitter,google and local authentication.

    Created by Dale.
*/

const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  FacebookStrategy = require('passport-facebook').Strategy,
  TwitterStrategy = require('passport-twitter').Strategy,
  GoogleStrategy = require('passport-google-oauth').OAuthStrategy

/*
    Confirguration belows, details external provider API keys and callback URL's ect.)
*/

// Change this is the front end form name fields change.
const localStrategyFields = {
  usernameField: 'email',
  passwordField: 'password',
passReqToCallback: true }

// Facebook fields (dales fb)
const facebookStrategyFields = {
  clientID: '294356564254458',
  clientSecret: '4c1ca548f206377818fe869fa057035a',
  callbackURL: 'http://localhost:1337/auth/facebookCallback/',
  profileFields: ['id', 'emails', 'gender', 'link',
    'locale', 'name', 'timezone', 'updated_time', 'verified', 'photos'],
  passReqToCallback: true
}

// Twitter fields (used twitter account associated with dale@farpoint.co.nz for keys)
const twitterStrategyFields = {
  consumerKey: 'yVTbxPx6FlasXEwwWw0owaAHw',
  consumerSecret: 'vZ8FQN4hcVcBXCmGWH9yxvtlqXAEJ9dGjoWqKDZWbcoKev73Pa',
  callbackURL: 'http://127.0.0.1:1337/auth/twitterCallback/',
  passReqToCallback: true
}

// Google fields (used dale@farpoint.co.nz for creating API key)
const googleStrategyFields = {
  consumerKey: '998518772662-83bluipuml5m7n19tipu2i79qafpquc4.apps.googleusercontent.com',
  consumerSecret: 'xQdKMAMfHU4X-cgnMiXkCWvM',
  // AIzaSyA1pzn_Q_OxcgbLDmdwMoZc81aiKKVM2ZU
  callbackURL: 'http://127.0.0.1:1337/auth/googleCallback/',
  passReqToCallback: true
}

/* 
   Handles the serialization and 
   deserialization proccess for session storage (keeps server memory low)
 */
passport.serializeUser(function (user, done) {
  done(null, user.id)
})

passport.deserializeUser(function (id, done) {
  User.findOne({ id: id }).populate('roles').exec(function (err, user) {
    done(err, user)
  })
})

// Local stratergy for logging in
const localStrategy = function (req, email, password, done) {
  User.findOne().where({or: [{email: email}, {username: req.allParams().username}]})
    .populate('roles').exec(function (err, user) {
    if (err) {
      done(err)
    }else if (!user) {
      done(new Error('Invalid username'))
    }else if (!user.verifyPassword(password)) {
      done(new Error('Invalid password'))
    }else {
      return done(null, user, { message: 'Succesfully logged in' })
    }
  })
}

// Generic statergy for external auths (facebook,twitter,google) emits code duplication.
const genericStratergy = function (req, accessToken, refreshToken, profile, done) {
  sails.log.debug(profile)
  UserService.createExternalUser(req, accessToken, refreshToken, profile).then(function (user) {
    sails.log.debug('Succesfully created new external user' + user)
    return done()
  }).catch(function (err) {
    sails.log.debug('Error when creating external user ' + err)
    return done(err)
  })
}

// Local auth
passport.use(new LocalStrategy(localStrategyFields, localStrategy))
// Facebook auth
passport.use(new FacebookStrategy(facebookStrategyFields, genericStratergy))
// Twitter auth
passport.use(new TwitterStrategy(twitterStrategyFields, genericStratergy))
// Google auth
passport.use(new GoogleStrategy(googleStrategyFields, genericStratergy))
