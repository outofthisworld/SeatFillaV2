module.exports = {
    autoPK:false,
    attributes: {
          id: {
            primaryKey: true,
            type: 'string',
            defaultsTo: function() {
                return require('node-uuid').v4();
            }
        },
        ip:{
          type:'string',
          notNull:true,
          required:true
        },
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
            type: 'string',
            defaultsTo: 'en-US'
        },
        currentLocation: {
            model: 'UserLocation',
            defaultsTo: null,
            required: false
        }
    }
}
