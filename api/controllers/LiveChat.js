

//Hmmmmmmm thinking about how I want to do this :D
//Just realised we need to identify the correct operators
module.exports = {
    _config:{
      shortcuts: false,
    },
    
    //TODO: create reqIsSocket policy
    //TODO: add ChatOperatorPolicy
    operatorConnect:function(req,res){
        sails.sockets.join(req,'ChatOperators');
    },
    //TODO: create reqIsSocket policy
    //TODO: add ChatOperatorPolicy
    operatorDisconnect: function(req,res){
        sails.sockets.leave(req,'ChatOperators');
    },
    //Post
    //This will connect the user to live chat
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
                req.session.livechat = {isConnected:true};
                LiveChat.publishCreate(liveChatR);
                return res.ok();
            }
        });
    },
    userDisconnect: function(req,res){
        LiveChat.destroy(sails.sockets.getId(req)).exec(function(err){ });
    },
    //TODO: add chatOperatorPolicy to this function
    //TODO: add POST policy to this function
    //This will send a message from a chat operator, to a specific user
    sendMessage: function(req,res){
      
      const message = req.param('message');
      const socketToRecieve = req.param('socket');
      
      sails.sockets.broadcast(socketToRecieve,'LiveChatMessage');
    },
    //TODO: add chatOperatorPolicy to this function
    //TODO: add POST policy to this function
    //This will notify the client that they have been accepted in live chat
    acceptClient: function(req,res){
        
        sails.sockets.broadcast('ChatOperators','OperatorClientAccept',
        {message:" Operator " + req.user.id + " accepted a client"})
        
        const operatorSocket = sails.sockets.getId(req);
        const socketToAccept = req.param('socket');
        
        LiveChat.findOne(socketToAccept).update({
            isAwaiting:false
        })
        
        sails.broadcast(socketToAccept,'LiveChatAccept', {
            
            operatorSocket: operatorSocket
        })
        
    },
    dismissUser: function(req,res){
        
    }
}