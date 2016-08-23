module.exports = {
  createUser: function (req) {
    return new Promise((resolve, reject) => {
      User.create(req.allParams()).exec((err, user) => {

        //Well ofc..
        if (err || !user) {
          //Debug something
          sails.log.debug('Error when creating user  ', err)
          return reject(err); 
        } else {

          // Get rid of confedential information..
          delete user.password
          delete user.passwordConfirmation

          // Register the sign up..
          Signup.create({ip: req.ip,user_agent: req.headers['user-agent'], user: user.id})
            .exec(function (err, signup) {

              //Handle error
              if (err) {
                sails.log.debug('Error creating sign up record for user id :' + user.id + 'Error: ' + err)
                return reject(err)
              }else {

                //Store verification id 
                user.verificationId = signup.id

                //Get the registration email template
                const message = sails.config.email.messageTemplates.registration(user)

                //Send an email async
                EmailService.sendEmailAsync(message)
                  .catch((err) => {
                    //Error sending email.. handle it
                    if (err) {
                      sails.log.debug('Failed to send email... ' + message + 'error: ' + err)
                      //The only way of handling this right now will be to verify the users email automatically..
                     
                      User.update(user.id, {isEmailVerified: true}).exec(function (err, updatedUserArr) {
                        if (err) {
                          sails.log.debug('Could not update and set users email to verified '+ user.id + 'error: ' + err)
                          return reject(err)
                        }
                      })
                    }
                  })
              }
            });
          return resolve(user)
        }
      })
    })
  },
  registerUser: function(){

  },
  deleteUser: function(){

  }
}
