/*
    Created by Dale.

    
    Displays a warning message via a toast when the user is diconnected from the website, due to their internet connecition
    or the webserver being down.
*/

$(document).ready(function() {
    io.socket.on('reconnecting', function(numAttempts) {
        $('#notification').attr('opened', '')
            .attr('text', 'Disconnected from server, attempting to reconnect... attempts(' + numAttempts + ')');
    });
});