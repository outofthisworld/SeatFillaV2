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
        apiUser: {
            model: 'ApiUsers',
            notNull: true,
            required: true
        },
        apiRoute: {
            model: 'ApiRoutes',
            notNull: true,
            required: true
        }
    }
}
