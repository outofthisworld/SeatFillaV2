//Note that createdAt / updatedAt are automatically appended to the entity
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
        link: {
            type: 'string',
            defaultsTo: null
        },
        icon: {
            type: 'string',
            defaultTo: null
        }
    }
}
