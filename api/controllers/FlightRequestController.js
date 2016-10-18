
const _create = require('../out/create');

module.exports = {
    create(req,res){
        //Create a new flight request using the create module
        _create(req,res).then(function(result){
            UserService.notifyUserLinksAsync(req.user).then(()=>{}).catch(function(err){
                sails.log.error(err);
            });
            return res.created(result);
        }).catch(function(err){
            // Differentiate between waterline-originated validation errors
            // and serious underlying issues. Respond with badRequest if a
            // validation error is encountered, w/ validation info.
            return res.negotiate(err);
        })
    }
}