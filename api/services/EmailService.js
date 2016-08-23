
var nodemailer = require('nodemailer');
var smtpPool = require('nodemailer-smtp-pool');

var transporter = nodemailer.createTransport(
    smtpTransport(sails.config.email.config)
);

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