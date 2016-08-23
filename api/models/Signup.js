/**
 * Signup.js
 *
 * This model is created when a user signs up.
 * The UUID generated will be sent in an email,
 * this will be then be used to retrieve the sign up record via attaching it to a get request ->
 * associate the id passed with a user, and sent the email status to verified.
 *
 * Additionally, information such as the I.P used to sign up and the user agent are stored
 * should they be needed later.
 */

//For ids (v4 is used)
const uuid = require('node-uuid');

module.exports = {
  autoPK: false,
  attributes: {
    id:{
      type:'string',
      primaryKey:true,
      defaultsTo: function(){ return uuid.v4(); }
    },
    ip: {
       type:'string',
       required:true,
    },
    user_agent: {
       type:'string',
       required:true
    },
    user:{
      model:'user',
      unique: true
    }
  }
};
