

module.exports = {
    find(req,res){
        require('../out/re-write/find')(req,res).then(function(result){
          return res.ok(result);
           
        }).catch(function(err){
            sails.log.error(err);
            return res.serverError();
        })
    }
}