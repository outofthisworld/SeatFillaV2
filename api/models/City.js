/**
 * City.js
 *
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

