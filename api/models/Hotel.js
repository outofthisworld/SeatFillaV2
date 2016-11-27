module.exports = {
    attributes: {
        id:{
          type:'string',
          primaryKey:true,
          defaultsTo:require('node-uuid').v4()
        },
        hotelUserComments: {
            collection: 'HotelUserComment',
            via: 'hotel'
        },
        hotelUserRating: {
            collection: 'HotelUserRating',
            via: 'hotel'
        },
        starRating: {
            type: 'integer',
            notNull: true
        },
        popularity:{
          type:'integer',
          defaultsTo:null
        },
        popularity_desc:{
          type:'string',
          defaultsTo:null
        },
        hotelImages: {
            collection: 'HotelImage',
            via: 'hotel'
        },
        hotelQueries:{
          collection:'HotelSearch',
          via:'hotels'
        },
        hotelPrices:{
          collection:'HotelPrices',
          via:'hotel'
        },
        hotelTags: {
            collection: 'HotelTag',
            via: 'hotels'
        },
        hotelName: {
            type: 'string',
            notNull: true,
            required: true
        },
        description: {
            type: 'string',
        },
        longitude: {
            type: 'string',
            notNull: true,
            required: true
        },
        latitude: {
            type: 'string',
            notNull: true,
            required: true
        },
        websiteURL: {
            type: 'string',
            notNull: true,
            required: true,
        },
        imageHostUrl:{
           type:'string',
           defaultsTo:null
        },
        hotelAgents:{
          collection:'Agents',
          via:'id'
        },
        hotelAmenities:{
          collection:'HotelAmenities',
          via:'hotels'
        },
        callingCode: {
            type: 'string',
        },
        phoneNumber: {
            type: 'string',
        },
        addressString:{
          type:'string',
        },
        user: {
          model: 'user',
          defaultsTo: null
        }
    }
}
