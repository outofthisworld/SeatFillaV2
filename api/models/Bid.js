/**
 * Bid.js
 *
 */

module.exports = {

  attributes: {
    bidAmount:{
      type:'number',
      required:'true',
    },
    bidCurrency:{
      type
    },
    flightOffer: {
      model: 'FlightOffer'
    },
    user: {
      model:'User'
    }
  }
};

