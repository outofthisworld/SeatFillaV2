/**
 * City.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  autoPK:false,
  attributes: {
    id:{
      type:'number',
      primaryKey:true
    },
    stateID: {
      type:'number',
      notNull:true,
      required:true
    },
    name:{
      type:'string',
      notNull:true,
      required:true
    }
  }
};

