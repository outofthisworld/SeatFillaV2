


module.exports = {
    autoPK:false,
    attributes:{
        //e.g FlightOffer/create
        route:{
            type:'String',
            primaryKey:true,
            required:true,
            notNull:true
        },
        apiRequests:{
           collection:'ApiRequest',
           via:'apiRoute'
        },
        webHooks:{
            collection:'Webhook',
            via:'routes'
        }
    }
}