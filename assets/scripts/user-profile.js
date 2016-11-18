$(window).ready(function () {
  $.seatfilla = $.seatfilla || {}
  $.seatfilla.userprofile = $.seatfilla.userprofile || {}

  $.seatfilla.loadprofile = function ($, io) {
    if (!io || !io || !options) throw new Error('Invalid params')

    const currentUserProfileUser = window.seatfilla.globals.userprofile.getCurrentUserProfileUser(window.location.pathname)

    if (!currentUserProfileUser) return

    /* END */
    $.seatfilla.userprofile.renderToProfile = function (arr, obj) {
      if (!arr) {
        console.log('Invalid `arr` passed to renderToProfile')
        return
      }

      const _this = this

      if (!obj) {
        console.log('Invalid `obj` passed to renderToProfile')
        return
      }

      const collectionAction = obj.action

      if (!(collectionAction) || !(typeof collectionAction == 'function')) {
        console.log('Invalid action in renderToProfile for obj ' + JSON.stringify(obj))
        return
      }

      if (Array.isArray(arr)) {
        arr.forEach(function (arrItem) {
          collectionAction.apply(_this, [arrItem])
        })
      } else {
        collectionAction.apply(_this, [arrItem])
      }
    }

    function displayDataEventHandler () {
      const _this = this

      console.log(_this)
      for (key in actionMapping) {
        console.log('Attempting to render key: ' + key)
        if (_this[key]) {
          console.log('Rendering key :' + key)
          console.log('Data: ' + JSON.stringify(_this[key]))
          console.log('Action mapping: ')
          console.log(actionMapping[key])

          if (actionMapping[key].beforeRender && typeof actionMapping[key].beforeRender === 'function')
            actionMapping[key].beforeRender(_this[key])

          renderToProfile.call(_this, _this[key], actionMapping[key])
        } else {
          console.log('Did not find `this` property name for ' + key + ' not rendering as collection. ')
        }
      }
    }

    io.socket.get('/user?username=' + currentUserProfileUser, function (user, jwRes) {
      if (!user) return
      if (Array.isArray(user) && !user.length) return
      if (Array.isArray(user)) user = user[0]

      if (jwRes.statusCode != 200) {
        alert('Invalid response from server')
        window.location.href = '/'
      }

      const responseHandler = function (data, jwRes) {
        const resolve = this.resolve
        const reject = this.reject

        console.log('Receieved data from path ' + this.path)
        console.log(data)
        console.log('Response was:' + jwRes.statusCode)
        if (jwRes.statusCode != 200)
          return reject(new Error(''))

        return resolve(data)
      }

      Promise.all([
        new Promise(function (resolve, reject) {
          io.socket.get('/userprofile/' + user.username, responseHandler.bind({
            path: '/userprofile/' + user.username,
            resolve,
          reject}))
        }),
        new Promise(function (resolve, reject) {
          io.socket.get('/userprofilecomment?user=' + user.id, responseHandler.bind({
            path: '/userprofilecomment?user=' + user.id,
            resolve,
          reject}))
        }),
        new Promise(function (resolve, reject) {
          io.socket.get('/userprofileimage?user=' + user.id, responseHandler.bind({
            path: '/userprofileimage?user=' + user.id,
            resolve,
          reject}))
        }),
        new Promise(function (resolve, reject) {
          io.socket.get('/userprofilelink?user=' + user.id, responseHandler.bind({
            path: '/userprofilelink?user=' + user.id,
            resolve,
          reject}))
        }),
        new Promise(function (resolve, reject) {
          io.socket.get('/bid?user=' + user.id, responseHandler.bind({
            path: '/bids?user=' + user.id,
            resolve,
          reject}))
        }),
        new Promise(function (resolve, reject) {
          io.socket.get('/flightRequest?user=' + user.id, responseHandler.bind({
            path: '/flightRequest?user=' + user.id,
            resolve,
          reject}))
        }),
        new Promise(function (resolve, reject) {
          io.socket.get('/flightGroup?user=' + user.id, responseHandler.bind({
            path: '/flightGroup?user=' + user.id,
            resolve,
          reject}))
        }),
        new Promise(function (resolve, reject) {
          io.socket.get('/hotel?user=' + user.id, responseHandler.bind({
            path: '/hotel?user=' + user.id,
            resolve,
          reject}))
        }),
        new Promise(function (resolve, reject) {
          io.socket.get('/notifications?user=' + user.id, responseHandler.bind({
            path: '/hotel?user=' + user.id,
            resolve,
          reject}))
        })
      ]).then(function (results) {
        const responseData = {
          userprofile: results[0],
          userprofilecomments: results[1].userProfileComments,
          userprofileimages: results[2],
          userprofilelinks: results[3],
          bids: results[4],
          flightrequests: results[5],
          flightgroups: results[6],
          hotels: [], // results[7]
          notifications: results[8],
        user
       },eventObj = {};

        $.seatfilla.userprofile.sendUserProfileCommentToServer = function (parentId, message, callback) {
          if (parentId) {
            $.ajax({
              data: {
                message,
                isReply: false,
                user: 'loggedinuser'
              },
              url: '/userprofile/' + responseData.userprofile.id + '/comments',
              success: function (data, ts, xhr) {},
              error: function () {}
            })
          } else {
            $.ajax({
              data: {
                message: message,
                isReply: true,
                user: 'loggedinuser',
              userProfile},
              url: '/userprofilecomment/' + parentId + '/replies',
              success: function (response, ts, xhr) {
                if (xhr.status == 200 && response && response.status == 200) {
                  console.log('Response adding comment ' + JSON.stringify(response))
                } else {
                  console.log('Error adding comment')
                }
              },
              error: function () {}
            })
          }
        }

        $.seatfilla.userprofile.sendUserProfileLinkRequestToServer = function () {
          $.ajax({
            url: '/userprofile/' + responseData.userprofile.id + '/userLinks',
            data: {
              user: 'loggedinuser',
              userprofile: responseData.userprofile.id
            },
            success: function (data, ts, xhr) {},
            error: function () {}
          })
        }

        $.seatfilla.userprofile.getCurrentProfileUser = function () {
          return currentUserProfileUser
        }

        // Complete this when know what data is being sent from the server
        $.seatfilla.userprofile.currentUserIsLink = function (cb) {
          window.seatfilla.globals.getUser(function (status, result) {
            if (status == 200 && result && result.username) {
              return cb(true)
            } else {
              return cb(false)
            }
          })
        }

        $.seatfilla.userprofile.isOwnProfile = function (cb) {
          window.seatfilla.globals.getUser(function (status, result) {
            if (status == 200 && result && result.username && result.username == currentUserProfileUser) {
              return cb(true)
            } else {
              return cb(false)
            }
          })
        }

        $.seatfilla.userprofile.getProfileInfo = function () {
          return responseData
        }

        $.seatfilla.userprofile.configure = function (callback) {
          if (callback && typeof callback == 'function') callback.call($.seatfilla.userprofile)
        }

        $.seatfilla.userprofile.socket = $.seatfilla.userprofile.socket || {};
        $.seatfilla.userprofile.socket.on = function (eventName, socketHandler) {
          if (!eventName || !socketHandler) return

          eventObj[attr] ? eventObj[attr].push(socketHandler) : [func]
        }

        $.seatfilla.userprofile.socket.trigger = function (eventName, verb, attribute, data) {
          if (!eventName || !verb || !data) {
            console.log('Invalid params passed to trigger')
            return
          }

          if (eventObj[eventName]) {
            eventObj[eventName].forEach(function (socketHandler) {
              if (attribute) {
                if (socketHandler[eventName] &&
                  socketHandler[eventName][verb] &&
                  socketHandler[eventName][verb][attribute] &&
                  typeof socketHandler[eventName][verb][attribute] == 'function'
                ) {
                  socketHandler[eventName][verb][attribute].call(responseData, data)
                }
              } else {
                if (socketHandler[eventName] && typeof socketHandler[eventName == 'function'])
                  socketHandler[eventName].call(responseData, data)
              }
            })
          } else {
            console.log('No socket handlers to handle event for ' + eventName)
          }
        }['userprofile',
        'userprofileimage',
        'userprofilelink',
        'userprofilecomment',
        'flightrequest',
        'flightgroup',
        'hotel',
        'user',
        'bids',
        'notifications'].forEach(function (eType) {
          io.socket.on(eType, function (data, jwRes) {
            if (jwRes.statusCode == 200) {
              const verb = data.verb.toLowerCase()
              const attribute = null
              switch (verb) {
                case 'addedto':
                case 'removedfrom':
                  attribute = data.attribute.toLowerCase()
              }
              $.seatfilla.userprofile.socket.trigger(eType, data.verb, attribute, data)
            } else {
              console.log('Error with socket event')
            }
          })
        })

        displayDataEventHandler.call(responseData)
      }).catch(function (err) {
        console.log(err)
      })
    })
  }
})

$.seatfilla.userprofile.loadprofile(jQuery, window.io)

const socketHandlerProto = {
  /*
        Applies validators to user profile data beforeRender being displayed.
        This can be used for example to confirm that triggered socket events
        belong to this profile, and that the data is not malformed.

        Note if no validators are supplied,this function will return true
        rather than false.
      */
  validateProfileData: function (data, validators) {
    var _validData = true
    const collectionValidators = validators

    function triggerValidator (func, thisArg, args) {
      if (!typeof func === 'function') {
        console.log('Invalid function passed to trigger validator')
        return
      }
      return func.apply(thisArg, args)
    }

    if (collectionValidators && typeof collectionValidators[Symbol.iterator] === 'function') {
      for (var i in Object.getOwnPropertyNames(collectionValidators)) {
        const validator = collectionValidators[i]
        triggerValidator(validator, null, [data])
      }
    } else if (Array.isArray(collectionValidators)) {
      for (var i = 0; i < collectionValidators.length; i++) {
        const validator = collectionValidators[i]
        if (typeof validator === 'function') {
          _validData = triggerValidator(validator, null, [data])
        }
        // Early return 
        if (!_validData) break
      }
    } else {
      console.log('Invalid validators type passed to validate profile data ')
    }

    return _validData
  }
}

$.seatfilla.userprofile.socket.on('userprofilecomments', {
  created: function (data) {},
  destroyed: function (data) {},
  updated: function (data) {}
})

$.seatfilla.userprofile.socket.on('userprofileimages', {
  created: function (data) {},
  destroyed: function (data) {},
  updated: function (data) {}
})

$.seatfilla.userprofile.socket.on('userprofilelinks', {
  created: function (data) {},
  destroyed: function (data) {},
  updated: function (data) {}
})

$.seatfilla.userprofile.socket.on('bids', {
  created: function (data) {},
  destroyed: function (data) {},
  updated: function (data) {}
})

$.seatfilla.userprofile.socket.on('flightrequests', {
  created: function (data) {},
  destroyed: function (data) {},
  updated: function (data) {}
})

$.seatfilla.userprofile.socket.on('flightgroups', {
  created: function (data) {},
  destroyed: function (data) {},
  updated: function (data) {}
})

$.seatfilla.userprofile.socket.on('userprofile', {
  created: function (data) {},
  destroyed: function (data) {},
  updated: function (data) {}
})

$.seatfilla.userprofile.socket.on('userprofilecomments', {
  created: function (data) {},
  destroyed: function (data) {},
  updated: function (data) {}
})

$.seatfilla.userprofile.socket.on('notifications', {
  created: function (data) {},
  destroyed: function (data) {},
  updated: function (data) {}
})

$.seatfilla.userprofile.socket.on('hotel', {
  addedto: {
    hotelusercomments: function (data) {
      console.log('(Hotel user comments): action: ' + action + ' data: ' + JSON.stringify(data))
    },
    hoteluserrating: function (data) {
      console.log('(Hotel user comments): action: ' + action + ' data: ' + JSON.stringify(data))
    }
  },
  removedfrom: {
    hotelusercomments: function (data) {
      console.log('(Hotel user comments): action: ' + action + ' data: ' + JSON.stringify(data))
    },
    hoteluserrating: function (data) {
      console.log('(Hotel user comments): action: ' + action + ' data: ' + JSON.stringify(data))
    }
  },
  created: function (data) {
    console.log('(Hotel event listener: ) action: created' + JSON.stringify(data))
  },
  destroyed: function (data) {
    console.log('(Hotel event listener: ) action: destroyed' + JSON.stringify(data))
  },
  updated: function (data) {
    console.log('(Hotel event listener: ) action: updated' + JSON.stringify(data))
  }
})

$.seatfilla.userprofile.socket.on('user', {
  addedto: {
    hotels: function (data) {},
    images: function (data) {},
    bids: function (data) {},
    flightrequests: function (data) {},
    flightgroups: function (data) {},
    notifications: function (data) {}
  },
  removedfrom: {
    hotels: function (data) {},
    images: function (data) {},
    bids: function (data) {},
    flightrequests: function (data) {},
    flightgroups: function (data) {},
    notifications: function (data) {}
  },
  // Ignored, triggered when a user is created
  created: function (data) {},
  // Ignored, triggered when a user is destroyed
  destroyed: function (data) {
    $.toaster({
      priority: 'info',
      message: 'This profile is not longer active'
    })
  },
  updated: function (data) {
    $.toaster({
      priority: 'info',
      message: 'This profile users info has been updated'
    })
  }
})
