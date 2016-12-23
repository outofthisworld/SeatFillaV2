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
            defaultsTo: ''
        },
        userProfile: {
            model: 'UserProfile',
            notNull: true
        },
        user: {
            model: 'User',
            notNull: true,
            required: true
        },
        isReply: {
            type: 'boolean',
            defaultsTo: false,
        },
        replies: {
            collection: 'UserProfileComment',
            via: 'id'
        }
    }
}
