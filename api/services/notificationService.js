module.exports = {
  // Lets handle sending async notifications to a (one) client.
  sendDedicatedNotificationAsync: function (req, done) {
    return function (message) {
      async.asyncify(function () {
        const socketId = req.session.notificationSocketId || sails.sockets.getId(req)
        if (req.user) {
          Notifications.create({
            user: req.user.id,
            message: message
          }).exec(function (err, notification) {
            if (err) return done(err, null)
          })
        }
        sails.log.debug('Send async notification via notificationService')
        sails.sockets.broadcast(socketId, 'NotificationService', message)
        return 'sent'
      })(function (result) {
        if (done && typeof done === 'function') return done(null, result)
      })
    }
  },
  //Sends a system notification to all users.
  sendSystemNotification:function(message){
      return new Promise(function(resolve,reject){
          sails.sockets.blast('SystemNotification', message);
          resolve('sent');
      });
  },
  //Returns a new promise withe the users lastest notifications
  findLatestNotifications: function (req) {
    return new Promise(function (resolve, reject) {
      const criteria = {sort: 'createdAt ASC',limit: 5}
         SystemNotifications.find().where(criteria).exec(
            function (err, systemNotifications) {
              if (err) return reject(err)
                if(req.user){
                    Notifications.find().where(criteria)
                    .exec(function (err, notifications) {
                       if (err) return reject(err)
                       resolve(notifications.concat(systemNotifications))
                    });
                }else{
                    resolve(systemNotifications);
                }
            });
     }).then(function (result) {
        result.sort(function (a, b) {
            return Date.parse(a.createdAt).getTime() - Date.parse(b.createdAt).getTime();
        });
        return result.splice(0, 5)
    });
  }
}
