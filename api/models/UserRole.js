/**
 * UserRole.js
 *
 */

module.exports = {
    autoPk: false,
    attributes: {
          id: {
            primaryKey: true,
            type: 'string',
            defaultsTo: function() {
                return require('node-uuid').v4();
            }
        },
        role: {
            type: 'string',
            notNull: true,
        },
        user: {
            collection: 'User',
            via: 'roles'
        }
    }
};
