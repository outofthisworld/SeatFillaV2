/*
    Handles recieving notifications from the server.

    Created by Dale.
*/

$(document).ready(function () {
  $('#notificationDropdown').on('click', function () {
    $('#unread_notifications').text('0')
  })

  // Subscribe to notifications 
  io.socket.get('/Notifications/subscribe', function (body, response) {
    console.log('Subscribing to notifications service, status code: ' + response.statusCode)
  })

  function notificationListener (data) {
    addNotification(data)
  }

  window.seatfilla.globals.getUser(function (status, result) {
    if (status == 200 && result && result.status == 200) {
      console.log('Find user: status : ' + status)
      const user = result.username
      console.log(user)

      io.socket.on('user', function (data) {
        console.log('recieved : ' + JSON.stringify(data))
        if (data.id == result.id) {
            if (data.verb) {
                const handler = {
                    addedTo: {
                        hotelBids: function (data) {},
                        flightBids: function (data) {},
                        notifications:function(data){addNoticiation(data)}
                    },
                    removedFrom: {
                        hotelBids: function (data) {$.toaster({message:'You have removed a bid',priority:'info'})}
                    }
                }

                if (!data.attribute && data.verb) {
                    message = handler[data.verb].call(null, data)
                }else if (data.verb in handler && data.attribute in handler[data.verb])
                    message = handler[data.verb][data.attribute].call(null, data)
                else {
                    console.log('No support for ' + data.verb + ' or association ' + data.attribute)
                }
            }
        }
      })
    } else {
      console.log('user not logged in listening for system notifications')
      // Listen for system notifications
      io.socket.on('systemnotifications', notificationListener)
      io.socket.on('NotificationService', notificationListener)
    }
  })

  // Retrieve our latest notifications
  $.get('/notifications/latestnotifications', function (data, r, p) {
    data.forEach(function (notification) {
      addNotification(notification)
    })
  })

  function addNotification (data) {
    if (!data) {
      return
    }

    var message = data.data || data;

    console.log('adding notification: ' + JSON.stringify(data))
    const html = '<li><a href="' + (message.link || '/') + '"><span class="fa fa-fw fa-tag"></span><span>' + message.message + '</span></a></li>'

    $('#notifications').append(html)

    if (!data.read) {
      $('#unread_notifications').text(parseInt($('#unread_notifications').text()) + 1)
    }
  }
})
