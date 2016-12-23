

module.exports = {
    autoPK:false,
    attributes:{
          id: {
            primaryKey: true,
            type: 'string',
            defaultsTo: function() {
                return require('node-uuid').v4();
            }
        },
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
