module.exports = {
    attributes: {
        countryCode: {
            type: 'string',
            model: 'country',
            via: 'alpha3code'
        },
        border: {
            type: 'string',
            notNull: true,
            required: true
        }
    }
}