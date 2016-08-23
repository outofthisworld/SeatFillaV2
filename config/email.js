
module.exports.email = {
    config:{
        //Using gmail
        service: 'Gmail',
        host:'localhost',
        auth:{
            username:'SeatFilla@gmail.com',
            password:'uxqieuklnocnxrbg'
            //password:'wcldugaeyozpmfxi'
        },

    },
    messageTemplates:{
       registration:function(object){
        return  {
                from: this.config.auth.username,
                to: object.email,
                subject: 'Welcome to SeatFilla, please verify your email!',
                html: 'Hello <em>' + object.firstName + '</em><br><br>'
                      + 'Thank you for registering with <em><i>SeatFilla</i></em! we require all new users '
                      + 'to register their email address with us. You can do so by clicking on the ' 
                      + 'link provided below. Happy flying! <br><br>' 
                      + 'Verification link: <br>'
                      + 'http://localhost:1337/verify/email?id=' + object.id
            }
        }
    }
}
