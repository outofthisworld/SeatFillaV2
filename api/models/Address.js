/**
 * Address.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    addressLine:{

    },
    addressLineTwo:{

    },
    addressLineThree:{

    },
    country: {

    },
    postcode: {

    },
    city:{

    },
    state:{

    },
    //One to many (User can have many addresses,
    //request can have one user.)
    user:{
      model:'user'
    }
  }
};
