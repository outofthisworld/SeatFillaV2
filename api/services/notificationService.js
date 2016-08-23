/*
  Created by dale
*/

module.exports = {
  // Lets handle sending async notifications to a (one) client.
  sendDedicatedNotificationAsync: function (req, done) {
    // Return a function which takes a message..
    return function (message) {
      // Lets run the asyncrounously since we're running database operations and javascript only has one thread..
      async.asyncify(function () {
        // Grab the socketID
        const socketId = req.session.notificationSocketId || sails.sockets.getId(req)

        // If the user is logged on, create a notification for the user.
        if (req.user) {
          Notifications.create({
            user: req.user.id,
            message: message,
            read: false
          }).exec(function (err, notification) {
            if (err) return done(err, null)
          })
        }

        // Log it..
        sails.log.debug('Send async notification via notificationService')

        // Send it to the right socket..
        sails.sockets.broadcast(socketId, 'NotificationService', message)

        // All good.
        return 'sent'
      })(function (result) {
        // Return to the caller
        if (done && typeof done === 'function') return done(null, result)
      })
    }
  },
  // Sends a system notification to all users.
  sendSystemNotification: function (message) {
    // Return a new promouse 
    return new Promise(function (resolve, reject) {
      // Create a system notification record..
      SystemNotifications.create({
        message: message,
        read: false
      }).exec(function (err, notification) {
        if (err) { reject(err);}
        sails.sockets.blast('SystemNotification', message)
        resolve('sent')
        return notification
      }).then(function (notification) {
        // Now assign the created notification to system notification users          
        User.find().exec((err, users) => {
          if (err) return Promise.reject(err)

          var systemNotificationUsers = users.map(user => {
            return {
              read: false,
              systemNotification: notification.id,
              user: user.id
            }
          })

          SystemNotificationUser.create(systemNotificationUsers)
            .exec(function (err, created) {
              if (err) return Promise.reject(err)
            })
        })
      })
    })
  },
  // Returns a new promise withe the users lastest notifications
  findLatestNotifications: function (req) {
    return new Promise(function (resolve, reject) {
      const criteria = {sort: 'createdAt ASC', limit: 5}
      SystemNotifications.find(criteria).exec(
        function (err, systemNotifications) {
          if (err) return reject(err)
          if (req.user) {
            criteria.where = {user: user.id}
            Notifications.find(criteria)
              .exec(function (err, notifications) {
                if (err) return reject(err)
                resolve(notifications.concat(systemNotifications))
              })
          }else {
            resolve(systemNotifications)
          }
        })
    }).then(function (result) {
      result.sort(function (a, b) {
        return Date.parse(a.createdAt).getTime() - Date.parse(b.createdAt).getTime()
      })
      return result.splice(0, 5)
    })
  }
}
