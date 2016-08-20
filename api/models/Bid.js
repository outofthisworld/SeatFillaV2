/**
 * Bid.js
 *
 */

module.exports = {

  attributes: {
    bidAmount:{
      type:'number',
      decimal:true,
      required:true
    },
    bidCurrency:{
      type:'string',
      required:true,
      notNull:true
    },
    flightOffer: {
      model: 'flightoffer',
      notNull:true,
      required:true
    },
    user: {
      model:'user'
    }
  }
};

