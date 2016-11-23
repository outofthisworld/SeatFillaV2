module.exports = {
    attributes: {
        countryCode: {
            type: 'string',
            model: 'country',
            via: 'alpha3code'
        },
        callingCode: {
            type: 'string',
            notNull: true,
            required: true
        }
    }
}