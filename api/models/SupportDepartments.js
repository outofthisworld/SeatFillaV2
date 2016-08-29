

//Lookup table
module.exports = {
    attributes:{
        departmentName:{
            required:true,
            notNull:true,
            type:'String'
        }
        supportTickets:{
            collection:'SupportTicket'
            via: 'topic'
        }
    }
}