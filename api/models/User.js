

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
    firstName:{
      type:'string',
      required: true,
      notNull:true,
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
      maxLength:50,
      minLength:1
    },
    username:{
      type:'string',
      required:true,
      unique:true,
      notNull:true,
      minLength:3,
      maxLength:20,

    },
    password:{
      type:'string',
      required:true,
      notNull:true,
      minLength:7, //8-25
      maxLength:26,
      notContains: function(cb){
          setTimeout(function() {
            cb(this.username);
          }, 1);
      }
    },
    passwordConfirmation:{
      type:'string',
      required:true,
      notNull:true,
      equals: function(cb){
        setTimeout(function(){
          cb(this.password);
        },1);
      }
    },
    birthDay:{
      type:'number',
      max:32,
      min:-1,
      required:true,
      notNull:true
    },
    birthMonth:{
      type:'number',
      integer:true,
      max:13, //Non inclusive
      min:-1, // 0
      notNull:true
    },
    birthYear:{
      type:'number',
      integer:true,
      notNull:true,
      min:1899 // 1900
    },
    isEmailConfirmed:{
      type:'boolean',
      boolean:true
    },
    isLockedOut:{
      type:'boolean',
      boolean:true
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
    emailConfirmed:()=>{
      return isEmailConfirmed;
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
      var obj = this.toObject();
      return obj;
    }
  },
  //Here we will hash the pass before it enters the db..
  beforeCreate: function (attrs, cb) {
    bcrypt.hash(attrs.password, SALT_WORK_FACTOR, function (err, hash) {
      if(err) return cb(err);

      attrs.password = hash;
      return cb();
    });
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

