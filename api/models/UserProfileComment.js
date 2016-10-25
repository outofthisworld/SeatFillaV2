module.exports = {
    attributes:{
        message:{
            type:'string',
            defaultsTo:''
        },
        userProfile:{
            model:'UserProfile',
            notNull:true
        },
        user:{
            model:'User',
            notNull:true,
            required:true
        }
    }
}