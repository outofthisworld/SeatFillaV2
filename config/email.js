module.exports.email = {
    config: {
        auth: {
            api_key: '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'
        },
    },
    messageTemplates: {
        messageTypes: {
            registration: 'registration',
            flightConfirmation: 'flightConfirmation'
        },
        registration: function(object) {
            return {
                from: 'SeatFilla.registration.com',
                to: object.email,
                subject: 'Welcome to SeatFilla, please verify your email!',
                type: 'registration',
                html: 'Hello <em>' + object.firstName + '</em><br><br>' +
                    'Thank you for registering with <em><i>SeatFilla</i></em! we require all new users ' +
                    'to register their email address with us. You can do so by clicking on the ' +
                    'link provided below. Happy flying! <br><br>' +
                    'Verification link: <br>' +
                    'http://localhost:1337/verify/email?verificationId=' + object.verificationId
            }
        },
        flightNotification: function(object) {
            return {
                from: 'SeatFilla.registration.com',
                to: object.email,
                subject: 'Welcome to SeatFilla, please verify your email!',
                type: 'flightnotification',
                html: ''
            }
        },
        //{ flightRequest, acceptedFlightRequest }
        flightRequestAccepted: function(object) {
            sails.log.debug('flight request accepted email params:')
            sails.log.debug(object)
            sails.log.debug('sending: ')
            const email =  {
                from: 'SeatFilla.com',
                to: object.flightRequest.user.email,
                subject: 'Your flight request has been accepted!',
                type: 'flightrequestaccept',
                html: 'Hello <em>' + object.flightRequest.user + ' <em><br/><br/>' +
                    'Your flight request has been accepted for an amount totaling less than what you offered, an offer of ' +
                    + object.acceptedFlightRequest.amount
                    + 'has been made. Please visit <a href="/Verify/pay?id='+object.acceptedFlightRequest.id+'"></a>'
                    + 'if you would like to accept this offer.'
            }
            sails.log.debug(email)
            return email;
        },
        userPaymentStatusFailiure: function(flightRequest,credit_card,err) {
            return {
                to: ['dale@farpoint.co.nz'],
                from: 'admin@seatfilla.com',
                subject: 'SeatFilla update user payment status failiure',
                html: 'Hello admin, <br/> An error has been encountered '
                + ' trying to update a users payment status for flight request ('
                + flightRequest.id + '). Payment has been recieved, however failed to be '
                + 'updated correctly within the database. This issue will require manual resolution.'
                + '<br> The user involved in this issue : ' + flightRequest.user.id
                + '<br> Error details: ' + JSON.stringify(err)
                + '<br> Error message: ' + err.message
            }
        },
        updateProviderPaymentStatusFailiure:function(flightRequest,err){
            return {
                to: ['dale@farpoint.co.nz'],
                from: 'admin@seatfilla.com',
                subject: 'SeatFilla update provider payment status failiure',
                html: 'Flight request concerned : ' + JSON.stringify(flightRequest) + '<br/>'
                + '<br/> Error ' + JSON.stringify(err) + '<br/> Error message: ' +  err.message
            }
        },
        sendProviderPaymentFailiure:function(flightRequest,err){
            return {
                to: ['dale@farpoint.co.nz'],
                from: 'admin@seatfilla.com',
                subject: 'SeatFilla send provider payment failiure',
                html: 'Flight request concerned : ' + JSON.stringify(flightRequest) + '<br/>'
                + '<br/> Error ' + JSON.stringify(err) + '<br/> Error message: ' +  err.message
            }
        }
    }
}
