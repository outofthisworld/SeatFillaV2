

module.exports = {
    attributes:{
        name:{
            type:'string'
        },
        key:{
            type:'string'
        },
        image:{
            type:'string'
        },
        hotels:{
            collection:'hotel',
            via:'hotelAmenities'
        }
    }
}