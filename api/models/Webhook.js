
const uuid = require('node-uuid');

module.exports = {
    autoPK:false,
    attributes:{
        id:{
            type:'string',
            primaryKey:true,
            defaultsTo: function(){ return uuid.v4(); }
        },
        url:{
            type:'string',
            notNull:true,
            required:true
        },
        user:{
            model:'User'
        },
        routes:{
            collection:'WebhookRoutes',
            via:'id'
        }
    }
}