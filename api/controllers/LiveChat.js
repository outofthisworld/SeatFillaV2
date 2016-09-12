
module.exports = {
    _config:{
      shortcuts: false,
    },
    //TODO: create reqIsSocket policy
    //TODO: add ChatOperatorPolicy
    //TODO: addLoggedInPolicy
    //Subscribes operators to the live chat channel
    operatorConnect:function(req,res){
        sails.sockets.join(req,'ChatOperators');
        return res.json({status:200,message:'Succesfully connected to operator channel'});
    },
    //TODO: create reqIsSocket policy
    //TODO: add ChatOperatorPolicy
    //TODO: addLoggedInPolicy
    //Disconnects operators from the live chat channel
    operatorDisconnect: function(req,res){
        sails.sockets.leave(req,'ChatOperators');
        return res.json({status:200,message:'Succesfully disconnected from operator channel'});
    },
    //TODO: create reqIsSocket policy
    //TODO: add ChatOperatorPolicy
    //TODO: addLoggedInPolicy
    //Allows an operator to close a conversation with a user.
    operatorCloseConversation: function(req,res){
        socketID = req.param('socket');
        LiveChat.destroy(socketID).exec(function(err){
            if(err){
                return res.json({status:500,message:'Error closing conversation, maybe its already closed?'});
            }
            return res.json({status:200,message:'Succesfully closed conversation'});
        });
         sails.broadcast(socketID,'ConversationClosed', {
            status:200, 
            message:'The conversation has been closed by the operator.'
        });
    },
 
    //This will connect the user to live chat and publish creation of the new record
    userConnect: function(req,res){
        
        //The socket ID of the currently connecting socket
        const socketId = sails.sockets.getId(req);
        
        LiveChat.create({
            socketID : socketId,
            displayName: req.param('displayName'),
            department: req.param('department'),
            subject: req.param('subject'),
            isAwaiting:true,
            user: req.user && req.user.id? req.user.id:null
        }).exec(function(err,liveChatR){
            if(err) {
                return res.json({error:err,errorMessage:err.message});
            }else{
                //Notify watchers that a new user has connected
                req.session.livechat = liveChatR;
                LiveChat.publishCreate(liveChatR);
                return res.ok();
            }
        });
    },
    //Disconnects a user from the live chat
    userDisconnect: function(req,res){
        LiveChat.destroy(sails.sockets.getId(req)).exec(function(err){ 
            if(err) return res.json({status:500,error:err});
            LiveChat.publishDestroy(sails.sockets.getId(req));
            sails.broadcast(sails.sockets.getId(req),'LiveChatDisonnect');
            return res.ok();
        });
    },
    //TODO: add chatOperatorPolicy to this function
    //TODO: add POST policy to this function
    //This will send a message from a chat operator, to a specific user
    sendMessage: function(req,res){
      
      const message = req.param('message');
      const socketToRecieve = req.param('socket');
      
      sails.sockets.broadcast(socketToRecieve,'LiveChatMessage',{
           message,
          name: req.session.livechat.displayName || req.user.firstName + ' ' +  req.user.lastName
      });
    },
    //TODO: add chatOperatorPolicy to this function
    //TODO: add POST policy to this function
    //This will notify the client that they have been accepted in live chat
    acceptClient: function(req,res){
        
        const operatorSocket = sails.sockets.getId(req);
    
        const socketToAccept = req.param('socket');
        
        LiveChat.findOne(socketToAccept).update({
            isAwaiting:false,
            operator: req.user.id
        }).exec(function(err,updated){
            if(err){
                return res.json({status:500,message:'Error when updating socket to accept in database'});
            }
            sails.sockets.broadcast('ChatOperators','OperatorClientAccept',
            
            {message:" Operator " + req.user.id + " accepted a client"})
               sails.broadcast(socketToAccept,'LiveChatAccept', {
            operatorSocket: operatorSocket
             });
             
             return res.json({status:200,message:'succesfully accepted client'});
            
        });
    },
    isTyping:function(req,res){
        const socketId = req.param('socket');
        sails.sockets.broadcast(socketId,'TypingEvent');
    }
}