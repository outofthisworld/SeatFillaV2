module.exports = function(req, res, next) {
    //Security measures.
    req.body.provider = 'local';
    delete req.body.id;
    delete req.body.isEmailVerified;
    delete req.body.isLockedOut;   
    return next();
};