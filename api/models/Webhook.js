
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
        sfVerificationParam:{
            type:'string',
            notNull:true,
            required:true
        },
        apiUser:{
            model:'ApiUsers',
            notNull:true,
            required:true
        },
        verificationToken:{
            type:'string',
            defaultTo:null
        },
        isVerified:{
            type:'boolean',
            defaultsTo:false
        },
        routes:{
            collection:'ApiRoutes',
            via:'route'
        }
    }
}