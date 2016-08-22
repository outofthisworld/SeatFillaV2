
module.exports = {
  attributes: {
    user: {
      model: 'User'
    },
    message:{
      type:'string',
      required:true,
      notNull:true,
    },
    read:{
      type:'boolean',
      defaultsTo:false,
      required:true
    }
  }
};

