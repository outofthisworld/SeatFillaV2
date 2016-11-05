
//Handle any reconnection procedures
io.socket.on('reconnecting', function(numAttempts) {
        $('#notification').attr('opened', '')
            .attr('text', 'Disconnected from server, attempting to reconnect... attempts(' + numAttempts + ')');
});

//Handle and disconnection procedures
io.socket.on('disconnect',function(){
        $.toaster({ priority : 'info',  message : 'Disconnected from Seatfilla service'});
});

//Handle any connection procedures
io.socket.on('connect',function(){
    io.socket.get('/Subscription/subscribeToUserSocketService',
        function(response){
            console.log('Attempted to subscribe to user socket service');
            console.log('Response was ' + response);
     });
});
