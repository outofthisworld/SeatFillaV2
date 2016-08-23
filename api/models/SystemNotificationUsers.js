

module.exports = {
    attributes: {
    systemNotification:{
       model:'SystemNotifications'
    },
    user: {
      model:'User'
    },
    read:{
      type:'boolean',
      defaultsTo:false
    }
  }
}