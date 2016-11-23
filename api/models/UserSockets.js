module.exports = {
    user: {
        model: 'user',
        via: 'id',
        notNull: true
    },
    socketId: {
        type: 'integer',
        notNull: true,
        required: true
    }
}