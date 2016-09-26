/**
 * UserRole.js
 *
 */

module.exports = {
    autoPk: false,
    seedData: [],
    attributes: {
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