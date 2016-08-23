
var nodemailer = require('nodemailer');
var smtpPool = require('nodemailer-smtp-transport');

var transporter = nodemailer.createTransport(
    smtpPool(sails.config.email.config)
);

transporter.use('stream', function(mail, callback){
    var addresses = mail.message.getAddresses();
    console.log('From: %s', JSON.stringify(addresses.from));
    console.log('To: %s', JSON.stringify(addresses.to));
    console.log('Cc: %s', JSON.stringify(addresses.cc));
    console.log('Bcc: %s', JSON.stringify(addresses.bcc));
    callback();
});

//Verify the server is running
transporter.verify(function(error, success) {
   if (error) {
        console.log(error);
   } else {
        console.log('Server is ready to take our messages');
   }
});

module.exports = {
    sendEmailAsync: function(message){
        return new Promise((resolve,reject)=>{
            transporter.sendMail(message, function(err,info){
                    if(err) return reject(err);
                    else resolve(info);
            });
        });
    },
    closeEmailService:function(){
        transporter.close();
    }
}