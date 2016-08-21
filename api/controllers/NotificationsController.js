/**
 * NotificationsController
 *
 * @description :: Server-side logic for managing Notifications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    /*
       Subscribes new users to their own room.
       The client side functionality for this should be enabled on all pages
       and will enable the server to push notifications to the client at any time. 
    */
    subscribe: function(req,res){
      //Check to see if this is a socket
      if(!req.isSocket) return res.badRequest();

      //If it is a socket then get its id
      const socketId = sails.sockets.getId(req);
      req.session.notificationSocketId = socketId;

      //Join the socket to its own room based on the socket id
      sails.sockets.join(req, socketId, function(err) {
        if (err) {
          return res.negotiate(err);
        }

        res.ok({status:200});

        notificationService.sendNotifyicationAsync(req,function(err,result){
            if(err){
                sails.debug.log('Error when broadcasting notification in NotificationsController');
            }else{
                sails.debug.log('Sent notification to:' + socketId)
            }
        })({
            message:"Succesfully subscribed to notiication service."
        });
      });
    },

};

