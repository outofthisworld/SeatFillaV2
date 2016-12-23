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
        hotel: {
            model: 'hotel',
            notNull: true,
            required: true
        },
        user: {
            model: 'user',
            notNull: true,
            required: true
        },
        isReply: {
            type: 'boolean',
            defaultsTo: false,
        },
        title: {
            type: 'string',
            defaultsTo: ''
        },
        message: {
            type: 'string',
            defaultsTo: ''
        },
        replies: {
            collection: 'HotelUserComment',
            via: 'id'
        }
    }
}
