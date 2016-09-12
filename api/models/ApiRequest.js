

module.exports = {

    attributes:{
        apiUser:{
            model:'ApiUsers',
            notNull:true,
            required:true
        },
        apiRoute:{
            model:'ApiRoutes',
            notNull:true,
            required:true
        }
    }
}