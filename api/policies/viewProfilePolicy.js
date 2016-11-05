
module.exports = function (req, res, next) {
  sails.log.debug('In view profile policy')
  sails.log.debug('Attemping to view profile :' + req.param('username'))


  if (!req.param('username')) return res.notFound()

  req.options = req.options || {}

  function isOwnProfile () {
    return (req.user && req.user.username) == req.param('username')
  }

  async.auto({
    findUser: function (callback) {
      ((function findUser () {
        if (isOwnProfile()) {
          return Promise.resolve(req.user)
        }else {
          return User.findOne({ username: req.param('username')})
          .then(function(user){return Promise.resolve(user)})
        }
      })()).then(function (user) {
        if (!user) return callback(new Error('User not found'), null)
        else return callback(null, user)
      }).catch(function (err) {
        sails.log.error(err)
        return callback(err, null)
      })
    },
    findUserProfile: ['findUser', function (callback, results) {
      const user = results.findUser
      UserProfile.find({
        user: user.id
      }).exec(function (err, userProfile) {
        if (err) return callback(err, null)
        else {
          if (Array.isArray(userProfile) && userProfile.length == 1) {
            return callback(null, userProfile[0])
          }else {
            const error = new Error('Invalid array length for userProfile : ' + userProfile.length)
            if(!userProfile){
              UserProfile.findOrCreate({user:user,description:'Welcome to seatfilla'})
              .exec(function(err,profile){
                  return callback(error, profile)
              })
            }else{
              return callback(error, null)
            }
          }
        }
      })
    }],
    isOwnProfile: ['findUserProfile', function (callback, results) {
      if ((req.user && req.user.username) == req.param('username')) {
        return callback(null, true)
      }else {
        return callback(null, false)
      }
    }],
    findUserProfileLinks: ['findUserProfile', function (callback, results) {
      UserProfileLink.find({userProfile: results.findUserProfile.id}).populate('user')
        .exec(function (err, links) {
          if (err) return callback(err, null)
          else {
            sails.log.debug('links : ' + JSON.stringify(links))
            return callback(null, links)
          }
        })
    }],
    findUserProfileLinkUserProfile: ['findUserProfileLinks', function (callback, results) {
      sails.log.debug('Finding user profile link user profiles')

      if (results.findUserProfileLinks.length == 0) {
        return callback(null, results.findUserProfilLinks)
      }

      results.findUserProfileLinks.forEach(function (userProfileLink, indx) {
        UserProfile.find({user: userProfileLink.user.id})
          .exec(function (err, result) {
            if (err) {
              sails.log.error(err)
              return callback(err, null)
            }


            results.findUserProfileLinks[indx].user.userProfile = Array.isArray(result) &&
            result.length == 1 ? result[0] : result

            if (indx == results.findUserProfileLinks.length - 1) {
              callback(null, results.findUserProfileLinks)
            }
          })
      })
    }],
    isLink: ['findUserProfile', 'isOwnProfile', 'findUserProfileLinks', function (callback, results) {
      const isOwnProfile = results.isOwnProfile
      const userProfile = results.findUserProfile
      const userProfileLinks = results.findUserProfileLinks

      if (isOwnProfile ||
        (req.user && userProfileLinks.filter(function (links) {
          return links.user == req.user.id
        }).length == 1)) {
        return callback(null, true)
      }else {
        return callback(null, false)
      }
    }],
    findUserProfileImages: ['findUserProfile', function (callback, results) {
      UserProfileImage.find({userProfile: results.findUserProfile.id})
        .exec(function (err, images) {
          if (err) return callback(err, null)
          else return callback(null, images)
        })
    }]
  }, function (err, results) {
    if (err) {
      sails.log.error(err)
      return res.redirect('/404');
    }else{
      req.options.userprofile = Object.assign({}, results.findUserProfile)
      req.options.userprofile.user = results.findUser
      req.options.userprofile.images = results.findUserProfileImages
    // req.options.userprofile.comments = results.findUserProfileCommentReplyUserProfiles
      req.options.userprofile.userLinks = results.findUserProfileLinkUserProfile
      req.options.userprofile.isLink = results.isLink
      req.options.userprofile.isOwnProfile = results.isOwnProfile

      sails.log.debug('Constructed user profile: ')
      sails.log.debug(JSON.stringify(req.options.userprofile))


      
      return next()
    }
  })
}
