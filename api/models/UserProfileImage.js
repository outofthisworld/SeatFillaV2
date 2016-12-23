/**
 * UserImages.js
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
