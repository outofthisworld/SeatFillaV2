

const uuid = require('node-uuid');

module.exports = {
    autoPK:false,
    attributes:{
        id:{
            type:'string',
            primaryKey:true,
            defaultsTo: function(){ return uuid.v4(); }
        },
        //e.g FlightOffer/create
        //    
        route:{
            type:'String',
            required:true,
            notNull:true
        }

    }
}