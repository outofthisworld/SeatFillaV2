module.exports = {
    attributes:{
        user:{
            model:'User',
            notNull:true,
            required:true,
        },
        hotel:{
            model:'Hotel',
            required:true,
            notNull:true
        },
        rating: {
            type:'integer',
            notNull:true,
            required:true
        }
    }
}