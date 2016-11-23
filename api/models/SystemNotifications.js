//Note that createdAt / updatedAt are automatically appended to the entity
module.exports = {
    attributes: {
        message: {
            type: 'string',
            notNull: true,
            required: true
        },
        link: {
            type: 'string',
            defaultsTo: null
        },
        icon: {
            type: 'string',
            defaultTo: null
        }
    }
}