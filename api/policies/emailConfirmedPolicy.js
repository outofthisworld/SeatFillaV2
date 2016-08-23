module.exports = function(req, res, next) {
  if(req.user && req.user.isEmailVerified){
      sails.log.debug('Succesfully passed validated email policy');
      return next();
  }
  return res.forbidden('Your email must be validated to perform this action');
};