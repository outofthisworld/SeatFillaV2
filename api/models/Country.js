/**
 * Country.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
autoPK:false,
  attributes: {
    autoPK:false,
    id:{
      type:'number',
      primaryKey:true,
      notNull:true
    },
    countryCode:{
      type:'string',
      notNull:true
    },
    country:{
      type:'string',
      notNull:true
    }
  }
};

