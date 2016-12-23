module.exports = {
    autoPK:false,
    attributes: {
          id: {
            primaryKey: true,
            type:'string',
            defaultsTo: function() {
                return require('node-uuid').v4();
            }
        },
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
