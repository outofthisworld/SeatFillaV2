/**
 * SupportTicket.js
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
        //The message for the support ticket
        message: {
            type: 'string',
            notNull: true,
            required: true
        },
        //(The user the support ticket belongs to) One to many relationship with user
        user: {
            model: 'user',
            notNull: true,
            required: true
        },
        topic: {
            model: 'SupportDepartments',
            notNull: true
        }
        //Created at and updated at are automatically attributes of the model.
    }
};
