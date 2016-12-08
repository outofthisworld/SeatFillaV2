module.exports = {
    attributes: {
        user: {
            model: 'user',
            unique: true,
        },
        displayImage:{
            model:'UserProfileImage',
            notNull:true
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