/*
    A policy to check that the domain that a 
*/
module.exports = function (req, res, next) {
  async.auto({
    check_ip: function (callback) {
      IpBlacklist.findOne({
        ip: req.ip
      }).then(function (result) {
        if (!result) {
          callback(null,true)
        } else {
          callback(new Error('Bad ip.'))
        }
      })
    }
  },function(err,results){
      if(err){
        sails.log.error(err)
        return res.forbidden(err)
      }else{
          return next();
      }
  })

}
