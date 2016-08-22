

//Note that createdAt / updatedAt are automatically appended to the entity
module.exports = {
    attributes: {
      message:{
        type:'string',
        notNull:true,
        required:true
      },
      systemNotificationUser: {
        collection: 'SystemNotificationUser',
        via: 'systemNotification'
      }
    }
}