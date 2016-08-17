/**
 * Request.js
 *
 */
module.exports = {
  attributes: {
    departureAirport:{
      type:'string',
      required:true,
      notNull:true
    },
    arrivalAirport:{
      type:'string',
      required:true,
      notNull:true
    },
    seatsRequired:{
      type: 'number',
      required:true,
      int:true,
      notNull:true
    },
    earliestDepartureDay:{
      type: 'number',
      integer:true,
      required:true,
      min: -1,
      max: 32,
      notNull:true
    },
    earliestDepartureMonth:{
      type: 'number',
      integer:true,
      required:true,
      min:0,
      max:13,
      notNull:true
    },
    earliestDepartureYear:{
      type: 'number',
      integer:true,
      required:true,
      notNull:true
    },
    latestDepartureDay:{
      type: 'number',
      integer:true,
      required:true,
      min: -1,
      max: 32,
      notNull:true
    },
    latestDepartureMonth:{
      type: 'number',
      integer:true,
      required:true,
      min:0,
      max:13,
      notNull:true
    },
    latestDepartureYear:{
      type: 'number',
      integer:true,
      required:true,
      notNull:true
    },
    requiresReturn: {
      type:'boolean',
      required:true
    },
    maximumPayment:{
      type:'number',
      decimal:true,
      finite:true,
      min:0,
      max:10001
    },
    willTakeOffers:{

    },
    //One to many (User can have many requests,
    //request can have one user.)
    owner:{
      model:'user'
    }
  },
  beforeCreate: function(record,cb){
    //Checks we have valid date ranges
    if((function(){
      const earliestDeparture = new Date(parseInt(record.earliestDepartureYear),
      parseInt(record.earliestDepartureMonth)-1,parseInt(record,earliestDepartureDay));

      const latestDeparture = new Date(parseInt(record.latestDepartureYear),
      parseInt(record,latestDepartureMonth)-1,parseInt(record.latestDepartureYear));

      return latestDeparture >= earliestDeparture;
    })(record) && (function(record){
      if(!record.requiresReturn) return true;

      const earliestReturn = new Date(parseInt(record.earliestReturnYear),
      parseInt(record.earliestReturnMonth)-1,parseInt(record,earliestReturnDay));

      const latestReturn = new Date(parseInt(record.latestReturnYear),
      parseInt(record,latestReturnMonth)-1,parseInt(record.latestReturnYear));

      return latestReturn >= latestReturn;
    })(record)){
      cb();
    }else{
      //Send it down the pipeline
      cb(new Error('Invalid date ranges creating a request.'));
    }
}
};

