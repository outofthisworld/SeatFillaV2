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
            model: 'user',
            unique: true,
        },
        images: {
            collection: 'UserProfileImage',
            via: 'userProfile'
        },
        description: {
            type: 'string',
            defaultsTo: null
        },
        comments: {
            collection: 'UserProfileComment',
            via: 'userProfile'
        },
        userLinks: {
            collection: 'UserProfileLink',
            via: 'userProfile'
        }
    }
}
