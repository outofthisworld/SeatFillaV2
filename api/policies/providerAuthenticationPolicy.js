const timeUtils = require('../utils/TimeUtils')

module.exports = function (req, res, next) {
  if (req.user && req.session.providerlogin) {
    if (timeUtils.millisecondsToMinutes(
        new Date().getTime() - req.session.providerlogin.authenticationTime.getTime()) >= 30) {
      delete req.session.providerlogin
      req.user.logout(req)
      req.flash('info', 'Your session has expired, please re-authenticate')
    }else{
      return next()
    }
  }
  
    req.flash('toaster-info', 'Welcome to the Seatfilla provider dashboard')
    if (req.path.indexOf('/provider/login') == -1) {
        return res.redirect('/provider/login')
    }else {
        return next()
    }
}
