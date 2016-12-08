module.exports = function(req,res,next){
    if(!req.param('id') || !req.user || req.param('id') != req.user.id){
        sails.log.debug('Failed in selfPolicy.js, sending bad request')
        return res.badRequest('Must be authenticated as this user')
    }
    return next();
}