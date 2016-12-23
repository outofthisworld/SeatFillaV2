/**
 * Bid.js
 *
 */
module.exports = {
    autoPK:false,
    attributes: {
          id: {
            primaryKey: true,
            type: 'string',
            defaultsTo: function() {
                return require('node-uuid').v4();
            }
        },
        bidAmount: {
            type: 'number',
            decimal: true,
            required: true
        },
        bidCurrency: {
            type: 'string',
            required: true,
            notNull: true
        },
        flightOffer: {
            model: 'flightoffer',
            notNull: true,
            required: true
        },
        user: {
            model: 'user',
            notNull:true,
            required:true,
        }
    }
};
