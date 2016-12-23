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
        user: {
            model: 'User',
            notNull: true,
            required: true,
        },
        hotel: {
            model: 'Hotel',
            required: true,
            notNull: true
        },
        rating: {
            type: 'integer',
            notNull: true,
            required: true
        }
    }
}
