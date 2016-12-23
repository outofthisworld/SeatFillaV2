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
        hotel:{
            model:'hotel',
            required:true,
            notNull:true
        },
        fileDescriptor:{
            type:'string',
            notNull:true,
            required:true
        },
        width:{
            type:'integer',
            notNull:true,
            required:true
        },
        height:{
            type:'integer',
            notNull:true,
            required:true
        },
        mimeType:{
            type:'string',
        },
        fileName:{
            type:'string',
            notNull:true,
            required:true
        },
        fileExt: {
            type:'string',
            notNull:true,
            required:true
        }
    }
}
