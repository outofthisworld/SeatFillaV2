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
    companyName:{
      type:'string',
      notNull:true,
      required:true
    },
    mobile:{
      type:'string',
      notNull:true,
      required:true
    },
    work:{
      type:'string',
      notNull:true,
      required:true
    },
    address:{
      type:'string',
      notNull:true,
      required:true
    },
    email:{
      type:'string',
      notNull:true,
      required:true
    }
  }
}
