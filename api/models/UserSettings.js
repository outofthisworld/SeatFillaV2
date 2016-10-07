module.exports = {
    attributes: {
        user: {
            model: 'user',
            unique: true,
            notNull: true
        },
        currencyCodePreference: {
            type: 'string',
            defaultsTo: 'USD'
        },
        localePreference: {
            type:'string',
            defaultsTo: 'en-gb'
        }
    }
}