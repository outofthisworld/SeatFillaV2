module.exports = {
    attributes: {
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