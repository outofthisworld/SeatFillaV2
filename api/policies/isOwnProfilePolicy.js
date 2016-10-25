module.exports = function(req, res, next) {
    if(req.getParam('username') == req.user.username){
        return next();
    }

    return res.forbidden();
}