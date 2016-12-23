module.exports = {
    autoPK:false,
    attributes:{
          id: {
            primaryKey: true,
            type: 'string',
            defaultsTo: function() {
                return require('node-uuid').v4();
            }
        },
        agent:{
            model:'HotelAgent',
            notNull:true,
            required:true
        },
        currency:{
            type:'string',
            notNull:true,
            required:true
        },
        price_total:{
            type:'string',
            notNull:true,
            required:true
        },
        deeplink:{
             type:'string',
             notNull:true,
             required:true
         },
        booking_deepLink:{
            type:'string',
            notNull:true,
            required:true
        },
        hotelSale:{
            model:'HotelSale',
            notNull:true,
            required:true
        }
    }
}
