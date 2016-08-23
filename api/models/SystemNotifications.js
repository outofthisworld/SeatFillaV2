

//Note that createdAt / updatedAt are automatically appended to the entity
module.exports = {
    attributes: {
      message:{
        type:'string',
        notNull:true,
        required:true
      },
      systemNotificationUsers:{
        collection: 'SystemNotificationUsers',
        via: 'systemNotification'
      }
  }
}