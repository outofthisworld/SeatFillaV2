/**
 * ApiUsers.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  autoPK:false,
  attributes: {
    apiToken:{
      type:'string',
      primaryKey:true,
      notNull:true,
      required:true
    },
    isVerified:{
      type:'boolean',
      defaultsTo:false,
      notNull:true
    },
    user: {
      model:'user',
      notNull:true,
      required:true
    }
  }
};

