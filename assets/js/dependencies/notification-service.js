/*
    Handles recieving notifications from the server.

    Created by Dale.
*/

$(document).ready(function() {

    //Subscribe to notifications 
    io.socket.get('/Notifications/subscribe', function(body, response) {
        console.log('Subscribing to notifications service, status code: ' + response.statusCode);
    });

    //Listen to notifications
    io.socket.on('NotificationService', function(data) {
        console.log(data);
        addNotification(data);
    });

    //Listen for system notifications
    io.socket.on('SystemNotification', function(data) {
        console.log(data);
        addNotification(data);
    });

    //Retrieve our latest notifications
    $.get("/notifications/latestNotifications", function(data) {
        console.log(data);
        //addNotification(data);
    });


    /*
    
            <li>
            <span class = "item"style = "background-color:lightblue;" >
            <span class = "item-info" >
            <span class = "lead" > Message name < /span> <p > This is a message < /p>
             </span> </span> </span> </li>
    */
    function addNotification(data) {
        $('#notifications-menu').append($('<li>').append(
            $('<span>').attr('class', 'item')
            .append($('<span>').attr('class', 'item-info').append($('<iron-icon>').attr('icon', 'social:notifications').css('color', 'black'))
                .append($('<span>').attr('class', 'lead').text(data.title))
                .append($('<p>').text(data.message)))));
    }
});