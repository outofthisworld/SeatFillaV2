module.exports = {
    attributes: {
        hotels: {
            collection: 'Hotel',
            via:'hotelTags'
        },
        tag: {
            type: 'string',
            notNull: true,
            required: true
        }
    }
}
