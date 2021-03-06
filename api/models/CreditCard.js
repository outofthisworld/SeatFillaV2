module.exports = {
    autoPK: false,
    attributes: {
        id: {
            type: 'string',
            primaryKey: true,
            defaultsTo: function() {
                return require('node-uuid').v4();
            }

        },
        valid_until: {
            type: 'datetime',
            notNull: true,
            required: true
        },
        state: {
            type: 'string',
            required: true
        },
        payer_id: {
            model: 'user',
            notNull: true,
            required: true
        },
        type: {
            type: 'string',
            required: true,
            notNull: true
        },
        expire_month: {
            type: 'integer',
            notNull: true,
            required: true
        },
        expire_year: {
            type: 'integer',
            notNull: true,
            required: true
        },
        first_name: {
            type: 'string',
            notNull: true,
            required: true
        },
        last_name: {
            type: 'string',
            notNull: true,
            required: true
        },
        create_time: {
            type: 'datetime',
            required: true,
            notNull: true
        },
        update_time: {
            type: 'datetime',
            required: true,
            notNull: true
        },
        ccLinks: {
            collection: 'CreditCardLinks',
            via: 'credit_card'
        }
    }
}
