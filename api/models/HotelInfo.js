module.exports = {
    attributes: {
        hotel: {
            model: 'hotel',
            unique: true
        },
        hotelImages: {
            collection: 'HotelImage',
            via: 'hotelInfo'
        },
        hotelTags: {
            collection: 'HotelTag',
            via: 'hotelInfo'
        },
        hotelName: {
            type: 'string',
            notNull: true,
            required: true
        },
        description: {
            type: 'string',
            notNull: true,
            required: true
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
        bookingURL: {
            type: 'string',
            notNull: true,
            required: true
        },
        callingCode: {
            type: 'string',
            notNull: true,
            required: true
        },
        phoneNumber: {
            type: 'string',
            notNull: true,
            required: true
        },
        starRating: {
            type: 'integer',
            notNull: true
        },
        address: {
            model: 'address',
            notNull: true,
            required: true
        }
    }
}