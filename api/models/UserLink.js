module.exports = {
    attributes:{
        user:{
            model:'user',
            via:'id',
            notNull:true,
            required:true
        },
        userLink:{
            mode:'user',
            via:'id',
            notNull:true,
            required:true
        }
    }
}