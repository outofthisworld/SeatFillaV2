
//Subscribe to the notification service

$(document).ready(function(){

  io.socket.get('/Notifications/subscribe', function (body, response) {
    console.log('Subscribing to notifications service, status code: ' + response.statusCode);
  });

  io.socket.on('NotificationService', function (data){
    console.log(data);
  });

  io.socket.on('blast',function(data){
    console.log(data);
  })
});
