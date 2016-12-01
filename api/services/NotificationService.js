/*
  Created by dale
*/

const functionalUtils = require('../utils/FunctionalUtils')

module.exports = {
    // Lets handle sending async notifications to a (one) client.
    sendDedicatedNotificationAsync: function(req, done,options) {
        // Return a function which takes a message..
        return function(message) {
            // Lets run the asyncrounously since we're running database operations and javascript only has one thread..

            if (!message || !message.message) return

            // Grab the socketID
            const socketId = req.session.notificationSocketId || sails.sockets.getId(req)

            function cb(func, args) {
                if (func && typeof func === 'function') func.apply(null, args)
            }
            // If the user is logged on, create a notification for the user.
            if (req.user) {
                Notifications.create(Object.assign({
                    user: req.user.id,
                    title: message.title || 'User Notification',
                    message: message.message,
                    read: false,
                    type: 'Individual',
                    link: '/'
                }, message)).then(function(notification) {
                    Notifications.publishCreate(notification)
                    User.publishAdd(req.user.id, 'notifications', notification)
                    sails.log.debug('created notification (user logged in )' + JSON.stringify(notification))
                    cb(done, [null, notification])
                }).catch(function(error) {
                    cb(done, [error, null])
                })
            } else {
                sails.log.debug('Broadcasting system notification to specified socket under event SystemNotifications ')
                    // Send it to the right socket..

                sails.sockets.broadcast(socketId, 'NotificationService', message)

                return cb(done, [null, message]) || 'sent'
            }
        }
    },
    sendNotification(message){
        if(!user || !message) return Promise.reject(new Error('Invalid user or message'))

        return new Promise(function(resolve,reject){
            Notifications.create(message)
            .then(function(notification){
                User.publishAdd(notification.user || notification.user.id, 'notifications', notification);
                Notification.publishCreate(notification);
                return resolve(notification)
            }).catch(function(err){
                return reject(err);
            })
        })
    },
    // Sends a system notification to all users.
    sendSystemNotification: function(message) {
        // Return a new promouse 
        return new Promise(function(resolve, reject) {
            async.auto({
                createNotification(callback) {
                    User.find().exec(function(err, users) {
                        users.forEach(function(user) {
                            Notifications.create(Object.assign({
                                user: user.id,
                                message: message.message,
                                title: message.title || 'Notification',
                                read: false,
                                link: '/',
                                type: 'System'
                            }, message)).exec(function(err, notification) {
                                if (err) {
                                    sails.log.error(err);
                                    return callback(err, null);
                                }
                                User.publishAdd(user.id, 'notifications', notification)
                            })
                        })
                        return callback(null, users);
                    })
                },
                createSystemNotification: ['createNotification', function(callback) {
                    SystemNotifications.create(Object.assign({
                        link: '/',
                        title: 'System Notification'
                    }, message)).exec(function(err, message) {
                        if (err) {
                            return callback(err, null)
                        } else {
                            SystemNotifications.publishCreate(message)
                            sails.log.debug('created system notification ' + JSON.stringify(message))
                            return callback(null, message)
                        }
                    })
                }]
            }, function(err, results) {
                if (err) {
                    sails.log.error(err)
                    return reject(err)
                } else {
                    return resolve(true)
                }
            })
        })
    },
    // Returns a new promise with the users latest notifications
    findLatestNotifications: function(req, criteria) {
        return new Promise(function(resolve, reject) {
            criteria = criteria || {}
            if (req.user) {
                criteria.where = {
                    user: req.user.id
                }
                return Notifications.find(criteria).then(function(notifications) {
                    return Promise.resolve(notifications)
                })
            } else {
                return SystemNotifications.find(criteria).then(function(systemNotifications) {
                    return Promise.resolve(systemNotifications)
                })
            }
        }).then(function(result) {
            result.sort(function(a, b) {
                return Date.parse(a.createdAt).getTime() - Date.parse(b.createdAt).getTime()
            })
            return result.splice(0, 5)
        })
    },
    // Notifies all links to a user.
    notifyUserLinksAsync(user) {
        return UserLink.find({
            user: user.id || (user.user && user.user.id) || user
        }).then(function(userLinks) {
            UserSocketService.find(userLinks.map(functionalUtils.mapTo('userLink')))
                .then(function(userSockets) {
                    userSockets.forEach(function(userSocket) {
                        sails.sockets.broadcast(userSocket.socketId, 'NotificationService', message)
                    })
                    return Promise.resolve({
                        status: 200
                    })
                }).catch(function(err) {
                    sails.log.error(err)
                    return Promise.reject(err)
                })
        })
    }
}