/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {
  if(req.user){
      sails.log.debug('Succesfully passed passport polcicy');
      return next();
  }


  sails.log.debug('Error authenticating passport policy in passportAuth.js');
  return res.forbidden('Must be authenticated to perform this action');
};
