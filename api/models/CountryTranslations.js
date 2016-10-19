
module.exports = {
    countryCode:{
        type:'string',
        model:'country',
        via:'alpha3code'
    },
    translation:{
        type:'string',
        notNull:true,
        required:true
    }
}