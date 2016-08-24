
module.exports.email = {
    config:{
        auth:{
             api_key:'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'
        },
    },
    messageTemplates:{
       messageTypes:{
           registration:'registration',
           flightConfirmation:'flightConfirmation'
       },
       registration:function(object){
        return  {
                from: 'SeatFilla.registration.com',
                to: object.email,
                subject: 'Welcome to SeatFilla, please verify your email!',
                type: 'registration',
                html: 'Hello <em>' + object.firstName + '</em><br><br>'
                      + 'Thank you for registering with <em><i>SeatFilla</i></em! we require all new users '
                      + 'to register their email address with us. You can do so by clicking on the ' 
                      + 'link provided below. Happy flying! <br><br>' 
                      + 'Verification link: <br>'
                      + 'http://localhost:1337/verify/email?verificationId=' + object.verificationId
            }
        }
    }
}
