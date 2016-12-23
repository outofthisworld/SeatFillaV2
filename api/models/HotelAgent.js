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
        name:{
            type:'string'
        },
        image_url:{
            type:'string'
        }
    }
}
