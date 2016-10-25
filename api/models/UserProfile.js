module.exports = {
    attributes:{
        user:{
            model:'user',
            unique:true,
        },
        image:{
            type:'string'
        },
        images: {
            collection: 'UserProfileImage',
            via: 'userProfile'
        },
        description:{
            type:'string',
            defaultsTo:null
        },
        comments:{
            collection:'UserProfileComment',
            via:'userProfile'
        },
        userLinks:{
            collection:'UserProfileLink',
            via:'userProfile'
        }
    }
}