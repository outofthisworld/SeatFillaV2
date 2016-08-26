/**
 * UserImages.js
 *
 */

module.exports = {

  attributes: {
    url:{
      type:'string',
      notNull:true,
      required:true
    },
    user:{
      model:'user',
      notNull:true,
      required:true
    }
  }
};

