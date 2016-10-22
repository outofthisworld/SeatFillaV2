const timeUtils = require('../utils/TimeUtils')

module.exports = function (req, res, next) {

    if (!ProviderService.hasSessionExpired(req)) {
        return next()
    }else{
        req.flash('info', 'Your session has expired, please re-validate');
    }
  
    req.flash('toaster-info', 'Welcome to the Seatfilla provider dashboard')
    if (req.path.indexOf('/provider/login') == -1) {
        return res.redirect('/provider/login')
    }else {
        return next()
    }
}