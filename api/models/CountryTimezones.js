module.exports = {
    attributes: {
        countryCode: {
            type: 'string',
            model: 'country',
            via: 'alpha3code'
        },
        timeZone: {
            type: 'string',
            notNull: true,
            required: true
        }
    }
}