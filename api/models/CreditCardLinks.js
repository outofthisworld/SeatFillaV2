module.exports = {
    attributes: {
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