//Just trying to think of what is needed haha -----where do you find that out?
//In my brain :D lol
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
        socketID: {
            type: 'string',
            notNull: true,
            required: true
        },
        displayName: {
            type: 'string',
            notNull: true,
            required: true
        },
        subject: {
            type: 'string',
            required: true,
            notNull: true
        },
        department: {
            model: 'SupportDepartments',
            required: true,
            notNull: true
        },
        isAwaiting: {
            type: 'boolean',
            defaultsTo: false,
            required: true,
            notNull: true
        },
        user: {
            model: 'user',
            required: false
        }
    }
}
