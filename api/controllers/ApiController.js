module.exports = {
    index(req,res){
        sails.log.debug('returning res.ok in api controller')
         return res.ok({tokens:req.user.apiKeys},{renderHtml:true});
    },
    documentation(req,res){
        return res.ok({},{renderHtml:true});
    }
}