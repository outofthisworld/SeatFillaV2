//Lookup table
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
        departmentName: {
            required: true,
            notNull: true,
            type: 'String'
        },
        supportTickets: {
            collection: 'SupportTicket',
            via: 'topic'
        }
    }
}
