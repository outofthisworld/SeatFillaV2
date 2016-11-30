module.exports = {
    attributes:{
        tag:{
            type:'string',
            notNull:true,
            required:true
        },
        hotels:{
            collection:'Hotel',
            via:'hotelTags'
        }
    }
}