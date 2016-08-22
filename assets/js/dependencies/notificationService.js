
//Subscribe to the notification service

$(document).ready(function(){

  //Subscribe to notifications 
  io.socket.get('/Notifications/subscribe', function (body, response) {
    console.log('Subscribing to notifications service, status code: ' + response.statusCode);
  });

  //Listen to notifications
  io.socket.on('NotificationService', function (data){
    console.log(data);
  });

  //Listen for system notifications
  io.socket.on('SystemNotification',function(data){
    console.log(data);
  });

  //Retrieve our latest notifications
  $.get( "/notifications/latestNotifications", function( data ) {
    console.log(data);
  });
});
