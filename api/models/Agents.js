module.exports = {
  attributes:{
    image_url:{
      type:'string',
      notNull:true,
      required:true
    },
    name:{
      type:'string',
      notNull:true,
      required:true
    },
    id:{
      type:'integer',
      primaryKey:true
    }
  }
}
