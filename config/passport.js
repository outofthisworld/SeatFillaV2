/*
    Contains all the logic for logging in via remote websites using SSO,
    current supports facebook,twitter,google and local authentication.

    Created by Dale.
*/


const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  FacebookStrategy = require('passport-facebook').Strategy,
  TwitterStrategy = require('passport-twitter').Strategy,
  GoogleStrategy = require('passport-google-oauth2').Strategy


const exportObject = {
  errorCodes() {
    return {
      InvalidUsername: 2,
      InvalidPassword: 4,
      ErrorUnknown: 8,
      Success: 200
    }
  }
}

const createTempUser = function (profile) {
  const info = {
    twitter: function (profile) {
      return {
        username: (function () {
          return profile.username || profile.displayName || (profile.name + require('node-uuid').v4().slice(0, 4))
        })(),
        provider: profile.provider || null,
        firstName: profile.name || null,
        displayName: profile.displayName || null,
        image: profile._json.profile_image_url || null,
        isEmailVerified: false,
        isLockedOut: false
      }
    },
    facebook: function (profile) {
      return {
        provider: profile.provider,
        firstName: profile._json.first_name,
        displayName: profile._json.first_name + ' ' + profile._json.last_name,
        lastName: profile._json.last_name,
        email: profile._json.email,
        username: (function () {
          if (!Array.isArray(profile.emails) || !profile.emails.length) {
            return ((profile.displayName || 'seatfillaFBUser') + require('node-uuid').v4().slice(0, 4))
          } else {
            return profile.emails[0].value.slice(0, profile.emails[0].value.indexOf('@')) + require('node-uuid').v4().slice(0, 4)
          }
        })(),
        image: (function () {
          if (Array.isArray(profile.photos) && profile.photos.length > 0) {
            return profile.photos[0].value
          } else {
            return null
          }
        })(),
        isEmailVerified: profile._json.verified,
        isLockedOut: false
      }
    },
    google: function (profile) {
      return {
        displayName: profile.displayName,
        firstName: (profile.name && profile.name.givenName) || (profile._json.name && profile._json.name.givenName),
        lastName: (profile.name && profile.name.lastName) || (profile._json.name && profile._json.name.lastName),
        image: profile._json.image.url,
        email: profile.email,
        username: (function () {
          if (!Array.isArray(profile.emails) || !profile.emails.length) {
            return ((profile.displayName && profile.displayName.replace(/ /, '')) || 'seatfillaGoogleUser') + require('node-uuid').v4().slice(0, 4)
          } else {
            return profile.emails[0].value.slice(0, profile.emails[0].value.indexOf('@')) + require('node-uuid').v4().slice(0, 4)
          }
        })(),
        isVerified: true
      }
    }
  }
  const providerKey = profile.provider + 'Id'
  const create = info[profile.provider].call(null, profile)
  create[providerKey] = profile.id
  create.provider = profile.provider
  return create
}

// Generic statergy for external auths (facebook,twitter,google) emits code duplication.
const genericStratergy = function (req, accessToken, refreshToken, profile, callback) {
  const create = createTempUser(profile)
  sails.log.debug('created temp user:')
  sails.log.debug(create)
  req.session.tempUser = create
  return callback(null, create)
}

// Local auth
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function (req, email, password, done) {
  sails.log.debug('Logging in via local strat, email: ' + email)
  sails.log.debug('Logging in via local strat, password: ' + password)

  if (!email) {
    const emailError = new Error()
    emailError.message = 'No email supplied'
    emailError.status = exportObject.errorCodes().InvalidUsername
    return done(emailError, null)
  } else if (!password) {
    const passwordError = new Error()
    passwordError.message = 'No password supplied'
    passwordError.status = exportObject.errorCodes().InvalidPassword
    return done(passwordError, null)
  }

  User.findOne().where({ or: [{ email: email.toLowerCase() }, { username: email.toLowerCase() }] })
    .populate('roles').exec(function (err, user) {
    sails.log.debug('Error finding user? :' + err)
    sails.log.debug('Found user?:  ' + JSON.stringify(user))
    const error = new Error()
    if (err) {
      sails.log.error(err, null)
      sails.log.debug('Local stratergy: Error unknown')
      error.message = err.message
      error.status = exportObject.errorCodes().ErrorUnknown
      return done(error, null)
    } else if (!user) {
      sails.log.debug('Local stratergy: Error invalid username')
      error.message = 'Invalid username'
      error.status = exportObject.errorCodes().InvalidUsername
      return done(error, null)
    } else if (!user.verifyPassword(password)) {
      sails.log.debug('Local stratergy: Error invalid password')
      error.message = 'Invalid password'
      error.status = exportObject.errorCodes().InvalidPassword
      return done(error, null)
    } else {
      sails.log.debug('Local stratergy: Success')
      return done(null, user)
    }
  })
}))

// Facebook auth
passport.use(new FacebookStrategy({
  clientID: '294356564254458',
  clientSecret: '4c1ca548f206377818fe869fa057035a',
  callbackURL: 'http://localhost:1337/auth/facebookCallback',
  profileFields: ['id', 'emails', 'gender', 'link',
    'locale', 'name', 'timezone', 'updated_time', 'verified', 'photos', 'displayName'
  ],
  passReqToCallback: true,
  enableProof: true
}, genericStratergy))

// Twitter auth
passport.use(new TwitterStrategy({
  consumerKey: 'yVTbxPx6FlasXEwwWw0owaAHw',
  consumerSecret: 'vZ8FQN4hcVcBXCmGWH9yxvtlqXAEJ9dGjoWqKDZWbcoKev73Pa',
  callbackURL: 'http://127.0.0.1:1337/auth/twitterCallback',
  passReqToCallback: true,
  enableProof: true
}, genericStratergy))

// Google auth
passport.use(new GoogleStrategy({
  consumerKey: '998518772662-83bluipuml5m7n19tipu2i79qafpquc4.apps.googleusercontent.com',
  consumerSecret: 'xQdKMAMfHU4X-cgnMiXkCWvM',
  clientID: '998518772662-83bluipuml5m7n19tipu2i79qafpquc4.apps.googleusercontent.com',
  clientSecret: 'xQdKMAMfHU4X-cgnMiXkCWvM',
  // AIzaSyA1pzn_Q_OxcgbLDmdwMoZc81aiKKVM2ZU
  callbackURL: 'http://127.0.0.1:1337/auth/googleCallback',
  passReqToCallback: true,
  enableProof: true
}, genericStratergy))

module.exports.passport = exportObject;
