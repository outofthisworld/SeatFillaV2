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
      notNull:true,
      min:1,
      max:5
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
    earliestReturnDay:{
      type: 'number',
      integer:true,
      min: -1,
      max: 32,
      defaultsTo:0
    },
    earliestReturnMonth:{
      type: 'number',
      min:0,
      max:13,
      defaultsTo:0
    },
    earliestReturnYear:{
      type: 'number',
      defaultsTo: 0
    },
    latestReturnDay:{
      type: 'number',
      integer:true,
      min: -1,
      max: 32,
      defaultsTo:0
    },
    latestReturnMonth:{
      type: 'number',
      integer:true,
      min:0,
      max:13,
      defaultsTo:0
    },
    latestReturnYear:{
      type: 'number',
      integer:true,
      defaultsTo:0
    },
    currency:{
      type:'string'
    },
    maximumPayment:{
      type:'number',
      decimal:true,
      min:0,
      max:10001
    },
    willTakeOffers:{
      type:'boolean',
      required:true,
      notNull:true
    },
    //One to many (User can have many requests,
    //request can have one user.)
    user:{
      model:'user'
    }
  },
  beforeCreate: function(record,cb){
    //Checks we have valid date ranges

    new Promise((resolve)=>{
      resolve(((record)=>{
        
        const earliestDeparture = new Date(parseInt(record.earliestDepartureYear),
        parseInt(record.earliestDepartureMonth)-1,parseInt(record,earliestDepartureDay));

        const latestDeparture = new Date(parseInt(record.latestDepartureYear),
        parseInt(record,latestDepartureMonth)-1,parseInt(record.latestDepartureYear));

        return latestDeparture >= earliestDeparture;
      })(record) && ((record)=>{
        if(!record.requiresReturn) {
          delete record.earliestReturnDay;
          delete record.earliestReturnYear;
          delete record.earliestReturnMonth;
          delete record.latestReturnDay;
          delete record.latestReturnYear;
          delete record.latestReturnMonth;
          return true;
        }else{
          const earliestReturn = new Date(parseInt(record.earliestReturnYear),
          parseInt(record.earliestReturnMonth)-1,parseInt(record,earliestReturnDay));

          const latestReturn = new Date(parseInt(record.latestReturnYear),
          parseInt(record,latestReturnMonth)-1,parseInt(record.latestReturnYear));

          return latestReturn >= earliestReturn;
        }
      })(record))}).then((isValid)=>{
        if(!isValid) cb(new Error('Error, invalid dates'));
        else cb();
      }).catch((err)=>{
        //Oops...
        cb(err);
      });
  }
};

