$(window).ready(function(){
    (function(io){
        window.seatfilla.window.seatfilla.globals.getUser(function(status,user){
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
                    if(eventHandlers[data]){
                        eventHandlers[data].call(user,data);
                    }
                }

                io.socket.get('/user?id='+user.id,function data(data){
                    data.status = 200;
                    window.seatfilla.globals.setUser(data);
                    console.log('Set current user to ' + JSON.stringify(data))
                    io.socket.on('user',userEventDelegator.bind(data));
                })
            }else{
              console.log('User not currently logged in');
            }
        })
    })(window.io)
})