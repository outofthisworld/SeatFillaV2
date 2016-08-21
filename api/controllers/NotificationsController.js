module.exports = {

  /*
     Subscribes new users to their own room.
     The client side functionality for this should be enabled on all pages
     and will enable the server to push notifications to the client at any time. 
  */
  subscribe: function (req, res) {
    // Check to see if this is a socket
    if (!req.isSocket) return res.badRequest()

    // If it is a socket then get its id
    const socketId = sails.sockets.getId(req)
    req.session.notificationSocketId = socketId

    // Join the socket to its own room based on the socket id
    sails.sockets.join(req, socketId, function (err) {
      if (err) {
        return res.negotiate(err)
      }
    });

    //Lets broadcast a message..
    notificationService.sendDedicatedNotificationAsync(req)({
      message: 'Succesfully subscribed to notification service.'
    });
    
    //All good
    return res.ok()
  },
  latestNotifications: function(req,res){
      //Make sure we only get requests from sockets or xhr..
      if(!req.isSocket || !req.xhr) return res.badRequest();

      //Use our notification service to find our latest notifications (both system and user specific)
      notificationService.findLatestNotifications(req).then(function(latestNotifications){
        //Return them to the client.
        return res.json({latestNotifications:latestNotifications});
      }).catch(function(err){
        //Ofc...
        return res.negotiate({error:err});
      });
  },
  // This is here for testing purposes
  sendNotification: function (req, res) {
    notificationService.sendSystemNotification(req.param('message'));
  }
}
