module.exports = {
    attributes: {
        countryCode: {
            type: 'string',
            model: 'country',
            via: 'alpha3code'
        },
        language: {
            type: 'string',
            notNull: true,
            required: true
        }
    }
}