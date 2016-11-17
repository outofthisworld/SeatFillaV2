
const _create = require('../out/create');

module.exports = {
    create(req,res){

        if(req.isGET()) {
            return res.ok({user:req.user,UserProfile:req.options.userprofile},{renderHtml:true});
        }
        
        //Create a new flight request using the create module
        _create(req).then(function(result){
            UserService.notifyUserLinksAsync(req.user).then(()=>{}).catch(function(err){
                sails.log.error(err);
            });
            return res.ok({
                result
        })
        }).catch(function(err){
            sails.log.error(err);
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