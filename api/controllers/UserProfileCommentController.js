const _find = require('../out/find')
const _create = require('../out/create')

module.exports = {
  find(req, res) {
    sails.log.debug('Finding all comments ')
    sails.log.debug(req.allParams())
    return _find(req, res).then(function (userProfileComments) {
      if (!userProfileComments || userProfileComments.length == 0) {
        res.ok([])
      }

      async.auto({
        findUserProfileComments: [function (callback, results) {
          sails.log.debug(userProfileComments)
          return callback(null, userProfileComments)
        }],
        findUserProfileCommentUserProfile: ['findUserProfileComments', function (callback, results) {
          sails.log.debug('Finding user profile comment user profiles')

          results.findUserProfileComments.forEach(function (userProfileComment, indx) {
            // sails.log.debug('in find userProfileCommentsUserProfile')
            // sails.log.debug(userProfileComment)
            UserProfile.find({
              user: userProfileComment.user.id
            })
              .exec(function (err, result) {
                if (err) {
                  sails.log.error(err)
                  return callback(err, null)
                }

                const finalProfile = Array.isArray(result) &&
                result.length == 1 ? result[0] : result

                // User profiles are a one-to-one relationship
                // as such querying the table with a user id should never return more than one
                // record for a given user id, this should never happen if the unique constraint 
                // is set on the given database table, but we will handle the error if it occurs.
                if (Array.isArray(finalProfile) && finalProfile.length < 0 || finalProfile.length > 1) {
                  return callback(new Error('Invalid database state: to many user profiles for user : ' +
                    userProfileComment.user.id), null)
                }

                results.findUserProfileComments[indx].user.userProfile = finalProfile

                if (indx == results.findUserProfileComments.length - 1) {
                  callback(null, results.findUserProfileComments)
                }
              })
          })
        }],
        findUserProfileCommentReplyUsers: ['findUserProfileComments', function (callback, results) {
          results.findUserProfileComments.forEach(function (comment, commentIndx) {
            comment.replies.forEach(function (reply, replyIndx) {
              User.findOne({
                id: reply.user
              })
                .exec(function (err, result) {
                  if (err) {
                    sails.log.error(err)
                    return callback(err, null)
                  }

                  results.findUserProfileComments[commentIndx].replies[replyIndx].user = result
                })
            })

            if (commentIndx == results.findUserProfileComments.length - 1) {
              return callback(null, results.findUserProfileComments)
            }
          })
        }],
        findUserProfileCommentReplyUserProfiles: ['findUserProfileCommentReplyUsers', function (callback, results) {
          results.findUserProfileCommentReplyUsers.forEach(function (comment, commentIndx) {
            comment.replies.forEach(function (reply, replyIndx) {
              UserProfile.findOne({
                id: reply.user
              })
                .exec(function (err, result) {
                  if (err) {
                    sails.log.error(err)
                    return callback(err, null)
                  }

                  results.findUserProfileCommentReplyUsers[commentIndx].replies[replyIndx].user.userProfile = result
                })
            })

            if (commentIndx == results.findUserProfileCommentReplyUsers.length - 1) {
              return callback(null, results.findUserProfileCommentReplyUsers)
            }
          })
        }]
      }, function (err, result) {
        if (err) {
          sails.log.error(err)
          return res.serverError();
        } else {
          res.ok(result.findUserProfileCommentReplyUserProfiles)
        }
      })
    }).catch(function (err) {
      sails.log.error(err)
      return res.serverError();
    })
  },
  /*
  passportAuthpolicy,
  setUserPolicy
  */
  create(req,res){
    req.setParam('user', req.user.id);
    const user = req.user
    return _create(req,{
          on: {
            // Hook the socket so we can transform the data with
            // Nested associations before it is sent.
            beforeSendToSocket(data, callback) {
               data.user = user;
               callback(null, data);
            }
          }
    }).then(function(created){
      return res.ok({status:ResponseStatus.OK})
    }).catch(function(err){
        sails.log.error(err);
      if(require('../utils/ErrorUtils').isWaterlineError(err)){
           return res.badRequest({status:ResponseStatus.BAD_REQUEST, 
             error: require('../utils/ErrorUtils').friendlyWaterlineError(err)})
      }else{
           return res.serverError({status:ResponseStatus.SERVER_ERROR, errors:[err]})
      }
    })
  },
  add(req,res){
    require('../out/add')(req,res,{
      on:{
        beforeSendToSocket(data,callback){
          sails.log.debug(data)
          data.user = req.user
          return callback(null,data);
        }
      }
    });
  },
  /*
    Make sure the user is logged in.
    
  */
  /*replyToComment(req, res) {
    if(!req.user){
      return res.ok({status:ResponseStatus.CLIENT_BAD_REQUEST,
         errors:['User must be logged in']})
    }

    req.setParam('user',req.user.id);
    const user = req.user;

    UserProfileComment.findOne({
      id: req.param('parentCommentId')
    }).populate('replies')
      .then(function (comment) {
        return _create(req, {
          on: {
            // Hook the socket so we can transform the data with
            // Nested associations before it is sent.
            beforeSendToSocket(data, callback) {
              sails.log.debug('Before send to socket : ' + JSON.stringify(data))
              comment.replies.add(data)
              comment.save(function (err) {
                if (err) {
                  sails.log.error(err)
                  callback(new Error('Error saving comment reply.'), null).then(function () {
                    return res.ok({
                      status: ResponseStatus.SERVER_ERROR,
                      errorMessage:'Unable to save collection associations comment.replies',
                      errors: [err]
                    })
                  }).catch(function (error) {
                    sails.log.error(error)
                    return res.ok({
                      status: ResponseStatus.SERVER_ERROR,
                      errorMessage:'Unable to remove database record',
                      errors: [err, error]
                    })
                  })
                } else {
                  sails.log.debug('Created new reply: ' + data)
                  data.parentCommentId = comment.id
                  data.user = user;
                  callback(null, data).then(function () {
                    return res.ok({
                      status: ResponseStatus.OK
                    })
                  })
                }
              })
            }
          }
        }).catch(function (err) {
          sails.log.error(err)
          return res.ok({
            status: ResponseStatus.SERVER_ERROR,
            errors: [err]
          })
        })
      })
  }*/
}
