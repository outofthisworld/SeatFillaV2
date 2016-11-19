$(window).ready(function () {
  (function ($, io) {
    $.seatfilla = $.seatfilla || {}
    $.seatfilla.userprofile = $.seatfilla.userprofile || {}
    const userProfileProto = {
      events: [],
      on: function (attr, func) {
        if (!attr) return false
        this.events[attr] = (this.events[attr] || []).push(func)
        return true
      },
      remove(attr, func) {
        if (!events[attr]) return false

        this.events[attr].forEach(function (f, indx) {
          if (f === func) {
            events[attr].slice(indx, 1)
          }
        })
      },
      trigger: function (attr, thisArg, paramArgs) {
        if (Array.isArray(attr) && attr.length) {
          var obj = this.events[attr[0]]
          for (var i = 1; i < attr.length; i++) {
            if (!obj) return
            obj = obj[attr[i]]
          }
          if (typeof obj == 'function') obj.apply(thisArg, paramArgs)
          if (Array.isArray(obj)) {
            obj.forEach(function (c) {
              if (typeof c == 'function') c.apply(thisArg, paramArgs)
            })
          }
          return
        }

        (this.events[attr]).forEach(function (f) {
          if (typeof f === 'function')
            f.apply(thisArg, paramArgs)
        })
      }
    }

    $.seatfilla.userprofile = Object.create(userProfileProto)
    $.seatfilla.userprofile.loadprofile = function () {
      if (!io || !io || !options) throw new Error('Invalid params')

      const currentUserProfileUser = window.seatfilla.globals.userprofile.getCurrentUserProfileUser(window.location.pathname)

      if (!currentUserProfileUser) return

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
            userprofilecomment: results[1].userProfileComments,
            userprofileimage: results[2],
            userprofilelink: results[3],
            bid: results[4],
            flightrequest: results[5],
            flightgroup: results[6],
            hotel: [], // results[7]
            notifications: results[8],
          user}

          $.seatfilla.userprofile.socket = $.seatfilla.userprofile.socket || Object.create(userProfileProto)
          $.seatfilla.userprofile.trigger('load', responseData)
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
          /*
            Function responsible fine graining data coming in from the socket
            and then triggering the appropriate event 
          */
          function handleSocketEvent (eventName, verb, attribute, data) {
            if (!eventName || !verb || !data) {
              console.log('Invalid params passed to trigger')
              return
            }
            if (attribute) {
              $.seatfilla.userprofile.socket.trigger([eventName, verb, attribute], responseData, data)
            } else {
              $.seatfilla.userprofile.socket.trigger([eventName, verb], responseData, data)
            }
          }

          // Listen for socket events from each of these models
          ['userprofile',
            'userprofileimage',
            'userprofilelink',
            'userprofilecomment',
            'flightrequest',
            'flightgroup',
            'hotel',
            'user',
            'bids',
            'notifications'
          ].forEach(function (eType) {
            // Set the socket listener
            io.socket.on(eType, function (data, jwRes) {
              // Make sure we have an `ok` response code
              if (jwRes.statusCode == 200) {
                // Get the verb from the data
                const verb = data.verb.toLowerCase()
                const attribute = null
                // Attempt to get the attribute from the data
                switch (verb) {
                  case 'addedto':
                  case 'removedfrom':
                    attribute = data.attribute.toLowerCase()
                }
                // Trigger/handle incoming data from the socket stream
                handleSocketEvent(eType, data.verb, attribute, data)
              } else {
                console.log('Error with socket event')
              }
            })
          })

          for (var key in responseData) {
            $.seatfilla.userprofile.socket.trigger([key, 'loadedFromSocket'], responseData, data)
          }
        }).catch(function (err) {
          console.log(err)
        })
      })
    }
  })(jQuery, window.io)
})

$.seatfilla.userprofile.loadprofile(jQuery, window.io)

$.seatfilla.userprofile.on('load', function () {
  const socketHandlerProto = {
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

  $.seatfilla.userprofile.socket.on('userprofilecomment', Object.create(socketHandlerProto, {
    validators: {
      created: [],
      destroyed: [],
      loadedFromSocket: [],
      updated: [],
      addedto: {
        xx: []
      },
      removedfrom: {

      }
    },
    created: function (data) {
      if (this.validateProfileData(data, validators.created)) {} else {}
    },
    destroyed: function (data) {},
    updated: function (data) {},
    loadedFromSocket: function (data) {
      console.log('Loaded from socket ')
      console.log(data)
    }
  }))

  $.seatfilla.userprofile.socket.on('userprofileimage', Object.create(socketHandlerProto, {
    validators: {
      created: [],
      destroyed: [],
      loadedFromSocket: [],
      updated: [],
      addedto: {
        xx: []
      },
      removedfrom: {

      }
    },
    created: function (data) {
      if (this.validateProfileData(data, validators.created)) {} else {}
    },
    destroyed: function (data) {},
    updated: function (data) {},
    loadedFromSocket: function (data) {
      console.log('Loaded from socket ')
      console.log(data)
    }
  }))

  $.seatfilla.userprofile.socket.on('userprofilelink', Object.create(socketHandlerProto, {
    validators: {
      created: [],
      destroyed: [],
      loadedFromSocket: [],
      updated: [],
      addedto: {
        xx: []
      },
      removedfrom: {

      }
    },
    created: function (data) {
      if (this.validateProfileData(data, validators.created)) {} else {}
    },
    destroyed: function (data) {},
    updated: function (data) {},
    loadedFromSocket: function (data) {
      console.log('Loaded from socket ')
      console.log(data)
    }
  }))

  $.seatfilla.userprofile.socket.on('bid', Object.create(socketHandlerProto, {
    validators: {
      created: [],
      destroyed: [],
      loadedFromSocket: [],
      updated: [],
      addedto: {
        xx: []
      },
      removedfrom: {

      }
    },
    created: function (data) {
      if (this.validateProfileData(data, validators.created)) {} else {}
    },
    destroyed: function (data) {},
    updated: function (data) {},
    loadedFromSocket: function (data) {
      console.log('Loaded from socket ')
      console.log(data)
    }
  }))

  $.seatfilla.userprofile.socket.on('flightrequest', Object.create(socketHandlerProto, {
    validators: {
      created: [],
      destroyed: [],
      loadedFromSocket: [],
      updated: [],
      addedto: {
        xx: []
      },
      removedfrom: {

      }
    },
    created: function (data) {
      if (this.validateProfileData(data, validators.created)) {} else {}
    },
    destroyed: function (data) {},
    updated: function (data) {},
    loadedFromSocket: function (data) {
      console.log('Loaded from socket ')
      console.log(data)
    }
  }))

  $.seatfilla.userprofile.socket.on('flightgroup', Object.create(socketHandlerProto, {
    validators: {
      created: [],
      destroyed: [],
      loadedFromSocket: [],
      updated: [],
      addedto: {
        xx: []
      },
      removedfrom: {

      }
    },
    created: function (data) {
      if (this.validateProfileData(data, validators.created)) {} else {}
    },
    destroyed: function (data) {},
    updated: function (data) {},
    loadedFromSocket: function (data) {
      console.log('Loaded from socket ')
      console.log(data)
    }
  }))

  $.seatfilla.userprofile.socket.on('userprofile', Object.create(socketHandlerProto, {
    validators: {
      created: [],
      destroyed: [],
      loadedFromSocket: [],
      updated: [],
      addedto: {
        xx: []
      },
      removedfrom: {

      }
    },
    created: function (data) {
      if (this.validateProfileData(data, validators.created)) {} else {}
    },
    destroyed: function (data) {},
    updated: function (data) {},
    loadedFromSocket: function (data) {
      console.log('Loaded from socket ')
      console.log(data)
    }
  }))

  $.seatfilla.userprofile.socket.on('userprofilecomment', Object.create(socketHandlerProto, {
    validators: {
      created: [],
      destroyed: [],
      loadedFromSocket: [],
      updated: [],
      addedto: {
        xx: []
      },
      removedfrom: {

      }
    },
    created: function (data) {
      if (this.validateProfileData(data, validators.created)) {} else {}
    },
    destroyed: function (data) {},
    updated: function (data) {},
    loadedFromSocket: function (data) {
      console.log('Loaded from socket ')
      console.log(data)
    }
  }))

  $.seatfilla.userprofile.socket.on('notifications', Object.create(socketHandlerProto, {
    validators: {
      created: [],
      destroyed: [],
      loadedFromSocket: [],
      updated: [],
      addedto: {
        xx: []
      },
      removedfrom: {

      }
    },
    created: function (data) {
      if (this.validateProfileData(data, validators.created)) {} else {}
    },
    destroyed: function (data) {},
    updated: function (data) {},
    loadedFromSocket: function (data) {}
  }))

  $.seatfilla.userprofile.socket.on('hotel', {
    validators: {
      created: [],
      destroyed: [],
      loadedFromSocket: [],
      updated: [],
      addedto: {
        xx: []
      },
      removedfrom: {

      }
    },
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
    },
    loadedFromSocket: function (data) {}
  })

  $.seatfilla.userprofile.socket.on('user', {
    validators: {
      created: [],
      destroyed: [],
      loadedFromSocket: [],
      updated: [],
      addedto: {
        xx: []
      },
      removedfrom: {

      }
    },
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
    },
    loadedFromSocket: function (data) {
      console.log('Loaded from socket ')
      console.log(data)
    }
  })
})
