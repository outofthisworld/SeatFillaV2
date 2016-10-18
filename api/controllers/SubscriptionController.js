

module.exports = {

    /*
        Function to subscribe users to the user socket service.

        Sails does not include support for associating users with sockets 
        or retrieving currently connected sockets.
        The user socket service is a way around this limitation.

        unsubscribing from the service is handled in sockets.js in the
        onDisconnect event.

        TODO: add isLoggedInPolicy (assumes the user is logged in)
    */
    subscribeToUserSocketService(req,res){
        const socketId = sails.sockets.getId(req);

        UserSocketService.subscribe(req.user.id, socketId).then(function(){
            return res.ok();
        }).catch(function(err){
            return res.badRequest();
        })
    }
}