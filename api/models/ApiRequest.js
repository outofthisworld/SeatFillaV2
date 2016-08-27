

module.exports = {

    attributes:{
        apiUser:{
            model:'ApiUsers',
            notNull:true,
            required:true
        },
        route:{
            model:'ApiRoutes'
            notNull:true,
            required:true
        }
    }
}