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
        message: {
            type: 'string',
            notNull: true,
            required: true
        },
        flightGroup: {
            model: 'FlightGroup',
            notNull: true,
            required: true
        },
        user: {
            model: 'User',
            notNull: true,
            required: true
        }
    }
}
