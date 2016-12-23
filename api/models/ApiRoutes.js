module.exports = {
    autoPK: false,
    attributes: {
          id: {
            primaryKey: true,
            type:'string',
            defaultsTo: function() {
                return require('node-uuid').v4();
            }
        },
        //e.g FlightOffer/create
        route: {
            type: 'String',
            primaryKey: true,
            required: true,
            notNull: true
        },
        apiRequests: {
            collection: 'ApiRequest',
            via: 'apiRoute'
        },
        webHooks: {
            collection: 'Webhook',
            via: 'routes'
        }
    }
}
