/**
 * FlightOffer.js
 *
 */

module.exports = {
  attributes: {
    type:{
      type:'string',
      notNull:true,
      required:true
    },
    ip:{
      type:'string',
      ip:true,
      notNull:true,
      required:true
    },
    apiKey:{
      type:'string',
      notNull:true,
      required:true   
    },
    departureAirportCode:{
      type:'string',
      required:true,
      notNull:true
    },
    departureDateTime:{
       type:'datetime',
    },
    arrivalAirportCode:{
      type:'string',
      required:true,
      notNull:true
    },
    arrivalDateTime:{
       type:'datetime',
       required:true,
       notNull:true,
       hasValidDates:true
    },
    flightNumber:{
      type:'string',
      required:true,
      notNull:true
    },
    carrier:{
      type:'string',
      notNull:true,
      required:true
    },
    minPrice:{
      type:'number',
      decimal:true,
      required:true,
      notNull:true,
      min:0,
      max:20001 //1 -> 20000
    },
    isReturnTrip:{
      type:'boolean',
      required:true,
      notNull:true
    },
    ticketsAvailable:{
      type:'number',
      int:true,
      max:11,
      min:0 //1 - 10
    },
    offerExpireDateTime:{
      type:'datetime',
      required:true,
    },
    bids: {
      collection: 'bid',
      via: 'flightOffer'
    }
  },
    types:{
     hasValidDates: function(arrivalDateTime){
       const arrivalDate = new Date(arrivalDateTime);
       const departureDate = new Date(this.departureDateTime);
       //Lets make sure that the flight doesn't 
       return !isNaN(arrivalDate.getTime()) && !isNaN(departureDate.getTime()) && arivalDate > departureDate;
     },
     isValidExpireTime: function(offerExpireDateTime){
       const threshold = 0.05; //1.2 hours
       const expireDate = new Date(offerExpireDateTime);
       const now = Date.now();
       const departureDate = new Date(this.departureDateTime);
       //Checks that expire date is atleast 22.8 hours from now and that it is less than the departure time for the flight.
       return !isNan(expireDate.getTime()) && !isNan(departureDate.getTime()) && expireDate <= departureDate
              && ((expireDate - now) / 1000 / 60 /  60 / 24) >= 1 - threshold; //Threshold will account for network latency
     }
  }

};

