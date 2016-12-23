module.exports = {

    /*
       Subscribes new users to their own room.
       The client side functionality for this should be enabled on all pages
       and will enable the server to push notifications to the client at any time.
    */
    subscribe: function(req, res) {
        // Check to see if this is a socket
        if (!req.isSocket) return res.badRequest()

        // If it is a socket then get its id
        const socketId = sails.sockets.getId(req)

        sails.sockets.join(req, socketId, function(err) {
            if (err) return res.badRequest()

            if (req.user) {
                Notifications.watch(req);
            } else {
                SystemNotifications.watch(req);
            }

            //Lets broadcast a message..
            NotificationService.sendDedicatedNotificationAsync(req)({
                title: 'Subscription notice',
                message: 'Succesfully subscribed to notification service.'
            });

            //All good
            return res.ok()
        })
    },
    // This is here for testing purposes (sends a system wide notification to all users)
    sendNotification: function(req, res) {
        NotificationService.sendSystemNotification({
            message: req.param('message')
        }).then(function(done) {
            return res.json({
                'status': 200
            })
        }).catch(function(err) {
            sails.log.debug('Error sending system notification ' + err);
            return res.json({
                'status': 500,
                error: err
            });
        });
    },
    findByUser(req,res){
        return res.ok({}, {
            view:'notifications/findByUser',
            renderHtml: true
        })
    }
    /*findByUser(req, res) {
        async.auto({
            findUser(callback) {
                User.findOne({
                        username: req.param('username').toLowerCase()
                    })
                    .then(function(user) {
                        if (!user) return callback(new Error('User not found'), null);
                        else return callback(null, _.isArray(user) && user.length ? user[0] : user)
                    }).catch(callback)
            },
            findNotifications: ['findUser', function(callback, results) {
                const query = Object.assign({
                    where: {
                        user: results.findUser.id
                    }
                }, req.allParams());
                if (!query.limit) query.limit = 20;
                if (!query.sort) query.sort = 'createdAt ASC';
                Notifications.find(query).populate('user').
                then(function(notifications) {
                    callback(null, notifications);
                }).catch(callback)
            }],
            findCount: ['findUser', function(callback, results) {
                Notifications.count({
                    user: results.findUser.id
                }).exec(function(err, count) {
                    if (err) return callback(err, null);
                    return callback(null, count);
                })
            }]
        }, function(err, results) {
            if (err) return res.negotiate(err);
            const final = {
                Notifications: results.findNotifications,
                TotalNotifications: results.findCount,
                Limit: req.param('limit') || 20,
                Skip: req.param('skip') || 0
            }
            if (!req.wantsJSON) {
                final.UserProfile = req.options.userprofile;
                return res.ok(final)
            } else {
                return res.ok(final,{
                    renderHtml: true
                })
            }
        })
    }*/
}
