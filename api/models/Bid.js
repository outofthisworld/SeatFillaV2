/**
 * Bid.js
 *
 */

module.exports = {

  attributes: {
    bidAmount:{
      type:'number',
      required:true
    },
    bidCurrency:{
      type:'string',
      required:true,
      notNull:true
    },
    flightOffer: {
      model: 'FlightOffer',
      notNull:true,
      required:true
    },
    user: {
      model:'user'
    }
  }
};

