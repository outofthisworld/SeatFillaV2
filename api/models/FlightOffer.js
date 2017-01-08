/**
 * FlightOffer.js
 *
 */

module.exports = {
    autoPK:false,
    attributes: {
        id: {
            primaryKey: true,
            type: 'string',
            defaultsTo: function() {
                return require('node-uuid').v4();
            }
        },
        apiUser: {
            type: 'ApiUsers',
        },
        provider:{
            type:'string'
        },
        departureIataCode:{
            type: 'string',
            required: true,
            notNull: true
        },
        departureDate: {
            type: 'datetime',
            notNull:true,
            required:true
        },
        arrivalIataCode: {
            type: 'string',
            required: true,
            notNull: true
        },
        arrivalDate: {
            type: 'datetime',
            required: true,
            notNull: true,
            hasValidDates: true
        },
        cabinClass:{
          type:'string',
          notNull:true,
          required:true,
        },
        numAdultTickets:{
          type:'integer',
          defaultsTo:0
        },
        numChildTickets:{
          type:'integer',
          defaultsTo:0
        },
        numInfantTickets:{
          type:'integer',
          defaultsTo:0
        },
        sellTicketsSeperately:{
          type:'boolean',
          defaultsTo:0
        },
        offerExpireDateTime: {
            type: 'datetime',
        },
        inboundLeg:{
          collection:'FlightLeg'
        },
        outboundLeg:{
          collection:'FlightLeg'
        },
        currency:{
          type:'string',
          notNull:true,
          required:true
        },
        bids: {
            collection: 'FlightBid',
            via: 'flightOffer'
        }
    },
    types: {
        hasValidDates: function(arrivalDateTime) {
            const arrivalDate = new Date(arrivalDateTime);
            const departureDate = new Date(this.departureDateTime);
            //Lets make sure that the flight doesn't
            return !isNaN(arrivalDate.getTime()) && !isNaN(departureDate.getTime()) && arivalDate > departureDate;
        },
        isValidExpireTime: function(offerExpireDateTime) {
            const threshold = 0.05; //1.2 hours
            const expireDate = new Date(offerExpireDateTime);
            const now = Date.now();
            const departureDate = new Date(this.departureDateTime);
            //Checks that expire date is atleast 22.8 hours from now and that it is less than the departure time for the flight.
            return !isNan(expireDate.getTime()) && !isNan(departureDate.getTime()) && expireDate <= departureDate &&
                ((expireDate - now) / 1000 / 60 / 60 / 24) >= 1 - threshold; //Threshold will account for network latency
        }
    }

};
