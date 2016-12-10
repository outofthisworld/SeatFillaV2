module.exports = function (req, res, done) {
  sails.log.debug('req.path: ' + req.path);
  if (!ProviderService.hasSessionExpired(req)) {
    if (req.path.indexOf('/provider/login') == -1 &&
       req.path.indexOf('/provider/payment') == -1
       && !ProviderService.getApiUser(req).paypalEmail) {
      return res.redirect('/provider/payment')
    }else{
    return done()
    }
  } else {
    req.flash('info', 'Your session has expired, please re-validate')
    if (req.path.indexOf('/provider/login') == -1) {
      return res.redirect('/provider/login')
    } else {
      return done()
    }
  }
}
