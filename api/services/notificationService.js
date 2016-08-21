
module.exports = {
    //Lets handle sending async notifications to a (one) client.
    sendNotificationAsync: function(req, done){
        return function(message){
            async.asyncify(function(){
                const socketId = req.session.notificationSocketId || sails.sockets.getId(req);
                if(req.user){
                    Notifications.create({
                        user:req.user.id,
                        message:message
                    }).exec(function(err,notification){
                        if(err) return done(err,null);
                    });
                }
                sails.log.debug('Send async notification via notificationService');
                sails.sockets.broadcast(socketId, 'NotificationService', message);
                return 'sent';
            })(function(result){
                if(done && typeof done === 'function') return done(null,result);
            });
        }
    },
    broadcastNotification
}