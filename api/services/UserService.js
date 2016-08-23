module.exports = {
  createUser: function (obj) {
    obj.provider = 'local'
    User.create(obj).exec(function (err, user) {
      if (err || !user) {
        sails.log.debug('Error when creating user  ', err)
        return res.negotiate(err)
      } else {
        delete user.password
        delete user.passwordConfirmation
        const message = sails.config.email.messageTemplates.registration(user)
        EmailService.sendEmailAsync(message)
          .then((info) => {
            if (res.wantsJSON()) return res.ok({user: user}, 'index')
            else return res.ok({user: req.session.user}, { view: 'user/myaccount', title: 'My Account'})
          }).catch((err) => {
          if (err) {
            sails.log.debug('Failed to send email... ' + message + 'error: ' + err)
            User.update(user.id, {isEmailVerified: true}).exec(function (err, updatedUserArr) {
              if (err) {
                sails.log.debug('Could not update and set users email to verified '
                  + user.id + 'error: ' + err)
                return err
              }else {
                return updatedUserArr[0]
              }
            })
          }
        })
      }
    })
  }

}
