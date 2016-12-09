/**
 * ApiUsers.js
 *
 */

module.exports = {
    autoPK: false,
    attributes: {
        apiToken: {
            type: 'string',
            primaryKey: true,
            notNull: true,
            required: true
        },
        isVerified: {
            type: 'boolean',
            defaultsTo: false,
            notNull: true
        },
        isBlocked: {
            type: 'boolean',
            defaultsTo: false,
            notNull: true
        },
        user: {
            model: 'user',
            notNull: true,
            required: true
        },
        paypalEmail:{
            type:'string'
        },
        apiRequests: {
            collection: 'ApiRequest',
            via: 'apiUser'
        },
        acceptedFlightRequests:{
            collection: 'AcceptedFlightRequest',
            via: 'apiUser'
        },
        secret: {
            type: 'string',
            notNull: true,
            required: true
        }
    }
};