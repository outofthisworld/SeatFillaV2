
const _create = require('../out/create');

module.exports = {
    create(req,res){
        if(req.param('username') && 
        req.user.username != req.param('username'))
            return res.redirect('/UserProfile/' + req.user.username + '/FlightRequest/Create');

        //Create a new flight request using the create module
        _create(req).then(function(result){
            UserService.notifyUserLinksAsync(req.user).then(()=>{}).catch(function(err){
                sails.log.error(err);
            });
            return res.ok({
                result
        })
        }).catch(function(err){
            // Differentiate between waterline-originated validation errors
            // and serious underlying issues. Respond with badRequest if a
            // validation error is encountered, w/ validation info.
            return res.negotiate(err);
        })
    },
    findByUser(req,res){
        if(!req.param('username')) return res.notFound();

        FlightRequest.find({
            user:req.param('username')
        }).then(function(FlightRequest){
            return res.ok({
                FlightRequest
            })
        })
    }
}