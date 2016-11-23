module.exports = function(req, res, next) {
    req.setParam('user', req.user.id);
    next();
}