module.exports = {
index(req,res){
    return res.ok({
        UserProfile:req.options.userprofile
      },{view:'userprofile/feed',
      renderHtml:true})
  }
}