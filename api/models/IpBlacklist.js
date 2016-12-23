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
        ip: {
            type: 'string',
            notNull: true,
            required: true
        },
    }
}
