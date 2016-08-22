module.exports = {
    read:{
        type:'boolean',
        required:true,
        defaultsTo:false
    },
    user: {
      model: 'User'
    },
    systemNotification:{
      model: 'SystemNotification'
    }
}