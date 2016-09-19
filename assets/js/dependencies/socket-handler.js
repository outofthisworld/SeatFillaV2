$(document).ready(function() {
    io.socket.on('reconnecting', function(numAttempts) {
        $('#notification').attr('opened', '').attr('text', 'Disconnected from server, attempting to reconnect... attempts(' + numAttempts + ')');
    });
});