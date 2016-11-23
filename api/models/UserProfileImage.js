/**
 * UserImages.js
 *
 */

module.exports = {

    attributes: {
        url: {
            type: 'string',
            notNull: true,
            required: true
        },
        userProfile: {
            model: 'UserProfile',
            notNull: true,
            required: true
        }
    }
};