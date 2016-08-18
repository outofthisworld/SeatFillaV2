/**
 * Address.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
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
    city: {
      model: 'city',
      notNull:true
    },
    country: {
      model: 'country',
      notNull:true
    },
    state: {
      model: 'state',
      notNull:false,
      required:false
    },
    //One to many (User can have many addresses,
    //request can have one user.)
    user:{
      model:'user'
    }
  }
};
