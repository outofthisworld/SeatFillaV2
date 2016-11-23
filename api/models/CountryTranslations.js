module.exports = {
    attributes: {
        countryCode: {
            type: 'string',
            model: 'country',
            via: 'alpha3code'
        },
        translation: {
            type: 'string',
            notNull: true,
            required: true
        },
        lang: {
            type: 'string',
            notNull: true,
            required: true
        }
    }
}