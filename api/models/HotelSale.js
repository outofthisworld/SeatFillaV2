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
        openUntil:{
          type:'datetime',
        },
        checkInDate:{
            type:'date',
            notNull:true,
            required:true
        },
        checkOutDate:{
            type:'date',
            notNull:true,
            required:true
        },
        numberOfGuests:{
            type:'integer',
            notNull:true,
            required:true
        },
        numberOfRooms:{
            type:'integer',
            notNull:true,
            required:true
        },
        saleType:{
            type:'string',
            notNull:true,
            required:true
        },
        status:{
            type:'string',
            notNull:true,
            required:true
        },
        currentWinner:{
            model:'user'
        },
        prices:{
            collection:'HotelPrices',
            via:'hotelSale'
        },
        bids:{
            collection:'HotelBid',
            via:'hotelSale'
        },
        hotel:{
            model:'hotel',
            required:true,
            notNull:true
        }
    }
}
