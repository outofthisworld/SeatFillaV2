$(window).ready(function(){
    (function(io){
        window.seatfilla.globals.getUser(function(status,user){
            if(status == 200 && user && user.status == 200){

                const socketEventHandlers = {
                    addedTo(data){
                        const user = this;
                        sails.log.debug(user.id + ' has had ' +  JSON.stringify(data) + ' added to their associatations');
                    },
                    removedFrom(data){
                        const user = this;
                        ails.log.debug(user.id + ' has had ' +  JSON.stringify(data) + ' removed from their associations');
                    },
                }

                function userEventDelegater(data){
                    const user = this;
                    console.log(data);
                    if(socketEventHandlers[data]){
                        socketEventHandlers[data].call(user,data);
                    }
                }

                io.socket.get('/user?id='+user.id,function data(data){
                    data.status = 200;
                    window.seatfilla.globals.setUser(data,function(status,cacheData){
                        console.log('Status setting user :' + status);
                        console.log('Cache return data : ' + JSON.stringify(cacheData));
                        console.log('Set current user to:')
                        console.log(data);
                        io.socket.on('user',userEventDelegater.bind(data));
                    });
                })
            }else{
              console.log('User not currently logged in '  + JSON.stringify(user));
            }
        })
    })(window.io)
})