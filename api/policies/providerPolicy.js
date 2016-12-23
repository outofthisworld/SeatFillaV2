module.exports = function (req, res, done) {
  function redirect(){
    if (req.path.indexOf('/provider/login') == -1) {
      req.flash('info', 'Your session has expired, please re-validate')
      return res.redirect('/provider/login')
    } else {
      return done()
    }
  }
  try{
  if (!ProviderService.hasSessionExpired(req)) {
    if (req.path.indexOf('/provider/login') == -1 &&
       req.path.indexOf('/provider/payment') == -1
       && !(ProviderService.getApiUser(req).paypalEmail)) {
      return res.redirect('/provider/payment')
    }else{
      sails.log.debug('going index')
      sails.log.debug((ProviderService.getApiUser(req).paypalEmail))
    return done()
    }
  } else {
    redirect();
  }
  }catch(err){
    redirect();
  }
}
