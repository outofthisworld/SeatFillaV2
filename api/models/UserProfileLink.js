module.exports = {
    attributes: {
        user: {
            model: 'user',
            notNull: true,
            required: true
        },
        userProfile: {
            model: 'UserProfile',
            notNull: true,
            required: true
        }
    }
}