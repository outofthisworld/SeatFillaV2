module.exports = {
    attributes: {
        message: {
            type: 'string',
            notNull: true,
            required: true
        },
        flightGroup: {
            model: 'FlightGroup',
            notNull: true,
            required: true
        },
        user: {
            model: 'User',
            notNull: true,
            required: true
        }
    }
}