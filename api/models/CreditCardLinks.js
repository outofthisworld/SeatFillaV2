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
        credit_card: {
            model: 'CreditCard',
            notNull: true,
            required: true
        },
        href: {
            type: 'string',
            notNull: true,
            required: true
        },
        rel: {
            type: 'string',
            notNull: true,
            required: true
        },
        method: {
            type: 'string',
            notNull: true,
            required: true
        }
    }
}
