module.exports = {
    attributes: {
        hotelInfo: {
            model: 'HotelInfo',
            notNull: true,
            required: true
        },
        tag: {
            type: 'string',
            notNull: true,
            required: true
        }
    }
}