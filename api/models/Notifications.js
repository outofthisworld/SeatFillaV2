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
            model: 'User'
        },
        title: {
            type: 'string',
            required: true,
            notNull: true
        },
        message: {
            type: 'string',
            required: true,
            notNull: true,
        },
        link: {
            type: 'string',
            defaultsTo: null
        },
        icon: {
            type: 'string',
            defaultsTo: null
        },
        read: {
            type: 'boolean',
            defaultsTo: false,
            required: true
        },
        type: {
            type: 'string',
            enum: ['System', 'Individual'],
            notNull: true,
            required: true
        }
    }
};
