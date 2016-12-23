module.exports = {
    autoPK: false,
    attributes: {
        id: {
            primaryKey: true,
            type:'string',
            defaultsTo: function() {
                return require('node-uuid').v4();
            }
        },
        flightRequest: {
            model: 'FlightRequest',
            required: true,
            notNull: true
        },
        apiUser: {
            model: 'ApiUsers',
            required: true,
            notNull: true,
        },
        validUntil: {
            type: 'datetime',
            notNull: true,
            required: true
        },
        amount:{
          type:'float',
          notNull:true,
          required:true
        },
        currency:{
          type:'string',
          required:true,
          notNull:true
        },
        userPaymentStatus: {
            type: 'string',
            enum: ['PENDING', 'PROCESSING', 'PAID'],
            notNull: true,
            required: true,
            defaultsTo: 'PENDING'
        },
        userPaymentId: {
            type: 'string',
            defaultsTo: null
        },
        providerPayoutStatus: {
            type: 'string',
            enum: ['PENDING', 'PROCESSING', 'PAID'],
            notNull: true,
            required: true,
            defaultsTo: 'PENDING'
        },
        providerPayoutBatchId: {
            type: 'string',
            defaultsTo: null
        },
        providerPayoutItemId: {
            type: 'string',
            defaultsTo: null
        }
    }
}
