/**
 * Address.js
 *
 */

module.exports = {
  attributes: {
    addressLine:{
      type:'string',
      required:true,
      notNull:true
    },
    addressLineTwo:{
      type:'string',
      required:true,
      notNull:true
    },
    addressLineThree:{
      type:'string',
      notNull:false,
      required:false
    },
    postcode: {
      type: 'number',
      required:true,
      notNull:true
    },
    //Look up tables
    city: {
      type:'number',
      notNull:true
    },
    country: {
      type:'number',
      notNull:true
    },
    state: {
      type:'number',
      notNull:false,
      required:false
    },
    //One to many 
    user:{
      model:'user'
    }
  }
};
