module.exports = {
    autoPK:false,
    attributes:{
          id: {
            primaryKey: true,
            type: 'string',
            defaultsTo: function() {
                return require('node-uuid').v4();
            }
        },
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
