/**
 * UserRole.js
 *
 */

module.exports = {
  autoPk:false,
  seedData:[],
  attributes: {
    id:{
      type:'number',
      integer:true,
      notNull:true,
      primaryKey:true
    },
    role:{
      type:'string',
      notNull:true,
    },
    user: {
      collection: 'User',
      via: 'roles'
    }
  }
};

