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
        owner: {
            model: 'User',
            notNull: true,
            required: true
        },
        members: {
            collection: 'User',
            via: 'flightGroups'
        },
        imagePath: {
            type: 'string',
            defaultsTo: null
        },
        description: {
            type: 'string',
            defaultsTo: '',
        },
        comments: {
            collection: 'FlightGroupComment',
            via: 'flightGroup'
        }
    }
}
