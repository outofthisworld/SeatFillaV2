/**
 * Country.js
 *
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

