

/**
 * User.js
 * This model represents a website user.
 */

//For ids (v4 is used)
const uuid = require('node-uuid');

//For hashing the password
const bcrypt = require('bcrypt');

//How hard we work on the salt
const SALT_WORK_FACTOR = 10;

module.exports = {
  autoPK: false,
  attributes: {
    id:{
      type:'string',
      primaryKey:true,
      defaultsTo: function(){ return uuid.v4(); }
    },
    facebookId:{
      type:'string',
      required:false,
      notNull:false
    },
    twitterId:{
      type:'string',
      required:false,
      notNull:false
    },
    googleId:{
      type:'string',
      required:false,
      notNull:false
    },
    firstName:{
      type:'string',
      required: true,
      notNull:true,
      minLength:1,
      maxLength:30
    },
    middleName:{
      type:'string',
      required:false,
      minLength:1,
      maxLength:30
    },
    lastName:{
      type:'string',
      required:true,
      notNull:true,
      minLength:1,
      maxLength:30
    },
    email:{
      type:'string',
      required:true,
      unique:true,
      notNull:true,
    },
    username:{
      type:'string',
      minLength:3,
      maxLength:20
    },
    password:{
      type:'string',
      minLength:7, //8-25
      maxLength:61
    },
    passwordConfirmation:{
      type:'string',
      equals: function(cb){
          cb(this.password);
      }
    },
    birthDay:{
      type:'string',
      integer:true,
      required:false
    },
    birthMonth:{
      type:'string',
      integer:true,
      required:false
    },
    provider:{
      type:'string',
      required:false,
      notNull:false,
      defaultsTo:'local'
    },
    birthYear:{
      type:'string',
      integer:true,
      required:false
    },
    isEmailVerified:{
      type:'boolean',
      defaultsTo:false
    },
    isLockedOut:{
      type:'boolean',
      defaultsTo:false
    },
    //One to many on requests
    requests: {
      collection: 'Request',
      via: 'user'
    },
    //One to many on addresses (may have duplicates however stops synchornization issues)
    addresses:{
      collection: 'Address',
      via:'user'
    },
    bids:{
      collection: 'Bid',
      via:'user'
    },
    apiKeys:{
      collection: 'ApiUsers',
      via:'user'
    },
    roles: {
      collection: 'UserRole',
      via: 'user',
      dominant: true
    },
    systemNotificationUsers:{
        collection: 'SystemNotificationUsers',
        via: 'systemNotification'
    },
    notifications: {
      collection: 'Notifications',
      via: 'user'
    },
    images:{
      collection: 'UserImage',
      via: 'user'
    },
    emailConfirmed:()=>{
      return this.isEmailConfirmed;
    },
    hasRole:(role)=>{
      if(this.roles.filter((r)=>{r.role === role}).length > 0){
        return true;
      } 
      return false;     
    },
    verifyPassword: function (password) {
      return bcrypt.compareSync(password, this.password);
    },
    changePassword: function(newPassword, cb){
      this.newPassword = newPassword;
      this.save(function(err, u) {
        return cb(err,u);
      });
    },
    toJSON: function() {
      delete this.password;
      delete this.passwordConfirmation;
      var obj = this.toObject();
      return obj;
    }
  },
  //Here we will hash the pass before it enters the db..
  beforeCreate: function (attrs, cb) {
    if(attrs.provider === 'local'){
      bcrypt.hash(attrs.password, SALT_WORK_FACTOR, function (err, hash) {
        if(err) return cb(err);

        attrs.password = hash;
        attrs.passwordConfirmation = hash;
        return cb();
      });
    }
  },
  beforeUpdate: function (attrs, cb) {
    if(attrs.newPassword){
      bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return cb(err);

        bcrypt.hash(attrs.newPassword, salt, function(err, crypted) {
          if(err) return cb(err);

          delete attrs.newPassword;
          attrs.password = crypted;
          return cb();
        });
      });
    }
    else {
      return cb();
    }
  }
};

