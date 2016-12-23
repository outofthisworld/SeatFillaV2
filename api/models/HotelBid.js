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
        bidAmount:{
            type:'float',
            notNull:true,
            required:true
        },
        currency:{
            type:'string',
            notNull:true,
            required:true
        },
        hotelSale:{
            model:'HotelSale',
            notNull:true,
            required:true
        },
        user:{
            model:'user',
            notNull:true,
            required:true
        }
    }
}
