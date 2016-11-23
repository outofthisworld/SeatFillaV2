module.exports = function(req, res, next) {
    if ((req.isAuthenticated || req.isAuthenticated()) && (req.user && req.user.hasRole('operator'))) {
        sails.log.debug('Succesfully authenticated chat operator');
        return next();
    }

    sails.log.debug('Operator policy failiure in policies/chatOperatorPolicy.js');
    return res.json({
        error: new Error('You are not permitted to perform this action')
    });
}