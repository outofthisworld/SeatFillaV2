module.exports = {
  index(req, res) {
    GettyImagesService.searchAndRetrieveUrls({
      phrase: 'city' + ' hotel',
      page: 1,
      pageSize: 100
    }).then(function (result) {
      return res.ok({
        user: req.user,
        images: result
      }, {
        view: 'index'
      })
    }).catch(function (err) {
      return res.badRequest()
    })
  },
  moreInfoRequired(req,res){
    return res.ok({user:req.session.tempUser})
  },
  login(req, res) {
    const rSuccess = req.param('redirectSuccess')
    const obj = _.clone(req.allParams())
    var base;
    
    if(rSuccess){
      base = rSuccess.slice(0, rSuccess.indexOf('?'))

      if (rSuccess.indexOf('?') != -1) {
        var pathPart;
        if (rSuccess.indexOf('&') != -1) {
          pathPart = rSuccess.slice(rSuccess.indexOf('?') + 1,rSuccess.indexOf('&')+1)
        }else {
          pathPart = rSuccess.slice(rSuccess.indexOf('?') + 1, rSuccess.length)
        }
        base += '?' + pathPart + '&'
      }else {
        base += '?'
      }
      delete obj.redirectSuccess

      sails.log.debug(obj)
    }

    return res.ok({
      redirectSuccess: rSuccess && (base + require('querystring').stringify(obj) || '/')
    }, {
      view: 'home/login'
    })
  },
  resendVerificationEmail(req, res) {
    return res.ok({
      user: req.user
    }, {
      view: 'home/resend-verfication-email'
    })
  },
  resetPassword(req, res) {
    return res.ok({
      user: req.user
    }, {
      view: 'home/reset-password.ejs',
      layout: 'layout'
    })
  },
  register(req, res) {
    return res.ok()
  },
  aboutus(req, res) {
    return res.ok({
      user: req.user
    })
  },
  contactus(req, res) {
    return res.ok({
      user: req.user
    })
  }
}
