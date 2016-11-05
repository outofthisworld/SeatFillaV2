module.exports = {
    attributes:{
        hotel:{
            model:'hotel',
            notNull:true,
            required:true
        },
        imageUrl:{
            type:'string',
            required:true
        },
        fileDescriptor:{
            type:'string',
            required:true
        }
    }
}