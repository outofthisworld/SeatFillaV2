/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
const querystring = require('querystring');
module.exports = function(req, res, next) {

    if (req.user) {
        sails.log.debug('Succesfully passed passport polcicy');
        return next();
    }

    sails.log.debug('In passport auth: returning failiure : ' + req.path )
    sails.log.debug('Error authenticating passport policy in passportAuth.js');
    if (req.wantsJSON) {
        return res.badRequest({
            error: 'User must be logged in',
            redirectUrl:'/login?redirectSuccess=' + req.path + '?' + querystring.stringify(req.allParams())
        })
    } else {
        return res.redirect('/login?redirectSuccess=' + req.path);
    }
};