module.exports = {
    attributes: {
        countryCode: {
            type: 'string',
            model: 'country',
            via: 'alpha3code'
        },
        currencyCode: {
            type: 'string',
            notNull: true,
            required: true
        }
    }
}