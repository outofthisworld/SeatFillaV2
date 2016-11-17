const _find = require('../out/find');


module.exports = {
    find(req, res){
      _find(req,res).then(function(){
        return res.ok({user:req.user},{layout:'layouts/search-layout'});
      }).catch(function(err){
        return res.badRequest(err);
      })
    },
   index(req, res) {
      return res.ok({
        user: req.user,
        params: req.allParams()
      }, {
        view: 'flightoffer/find.ejs',
        layout: 'layouts/search-layout'
      })
  },
}