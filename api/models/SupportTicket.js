/**
 * SupportTicket.js
 *
 */

module.exports = {

  attributes: {

    //The message for the support ticket
    message:{
      type:'string',
      notNull:true,
      required:true
    },
    //(The user the support ticket belongs to) One to many relationship with user
    user:{
      model:'user',
      notNull:true,
      required:true
    },
    topic:{
      model:'SupportDepartments',
      notNull:true
    }
    //Created at and updated at are automatically attributes of the model.
  }
};

