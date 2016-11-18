$(window).ready(function () {
  (function ($, io, options) {
    if (!io || !io || !options) throw new Error('Invalid params')

    const currentUserProfileUser = window.seatfilla.globals.userprofile.getCurrentUserProfileUser(window.location.pathname)

    if (!currentUserProfileUser) return

    console.log('Current viewing user profile for :' + currentUserProfileUser)

    /*
      Applies validators to user profile data before being displayed.
      This can be used for example to confirm that triggered socket events
      belong to this profile, and that the data is not malformed.

      Note if no validators are supplied,this function will return true
      rather than false.
    */
    const validateProfileData = function (data, validators) {
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

    /* UTILITY FUNCTIONS, THESE MAY EXTEND JQUERY IN THE FUTURE
    
    */

    function addFlightRequestToProfile (data, validators) {
      if (validateProfileData.call(data, validators)) {
        $.loadAndRenderTemplate({
          containerAction: 'append',
          renderData: options.renderProfiles.userProfileFlightRequests,
        data})
      } else {
        console.log('Not rendering flight request was not valid')
      }
    }

    function addFlightGroupToProfile (data, validators) {
      if (validateProfileData.call(data, validators)) {
        $.loadAndRenderTemplate({
          renderData: options.renderProfiles.userProfileFlightGroups,
          containerAction: 'append',
        data})
      } else {
        console.log('Not rendering flight group was not valid')
      }
    }

    function addBidToProfile (data, validators) {
      if (validateProfileData(data, validators)) {
        $.loadAndRenderTemplate({
          renderData: options.renderProfiles.userProfileBids,
          containerAction: 'append',
        data})
      } else {
        console.log('Not rendering bid was not valid')
      }
    }

    // Hotel created, user hotels addedTo
    function addHotelToProfile (data, validators) {
      if (validateProfileData(data, validators)) {
        $.loadAndRenderTemplate({
          renderData: options.renderProfiles.userProfileHotels,
          containerAction: 'append',
        data})
      } else {
        console.log('Not rendering hotel was not valid')
      }
    }

    // UserProfileComment created, userprofile addedTo
    function addCommentToProfile (data, validators) {
      if (validateProfileData(data, validators)) {
        $.loadAndRenderTemplate({
          renderData: options.renderProfiles.userProfileComments,
          containerAction: 'append',
        data})
      } else {
        console.log('Not rendering comment was not valid')
      }
    }

    // UserProfileComments create, UserProfileComment addedTo UserProfile
    function addCommentReplyToProfile (data, validators) {
      if (validateProfileData(data, validators)) {
        $.loadAndRenderTemplate({
          renderData: options.renderProfiles.userProfileCommentReplies,
          containerAction: 'append',
        data})
      } else {
        console.log('Not rendering comment reply not valid')
      }
    }

    function addImageToProfile (data, validators) {
      if (validateProfileData(data, validators)) {
        $.loadAndRenderTemplate({
          renderData: options.renderProfiles.userProfileImages,
          containerAction: 'append',
        data})
      } else {
        console.log('Not rendering user profile image was not valid')
      }
    }

    function displayUserProfileInfo (data, validators) {
      if (this.validateProfileData(data, validators)) {
        loadAndRenderTemplate({
          renderData: options.renderProfiles.userProfileInfo,
          containerAction: 'html',
        data})
      } else {}
    }

    /* END */

    function renderToProfile (arr, obj) {
      if (!arr) {
        console.log('Invalid `arr` passed to renderToProfile')
        returnl
      }

      const _this = this

      if (!obj) {
        console.log('Invalid `obj` passed to renderToProfile')
        returnl
      }

      const collectionAction = obj.action

      if (!(collectionAction) || !(typeof collectionAction == 'function')) {
        console.log('Invalid action in renderToProfile for obj ' + JSON.stringify(obj))
        return
      }

      if (Array.isArray(arr)) {
        arr.forEach(function (arrItem) {
          collectionAction.apply(_this, [arrItem, obj.validators])
        })
      } else {
        collectionAction.apply(_this, [arr, obj.validators])
      }
    }

    const actionMapping = {
      'userprofilecomments': {
        action: addCommentToProfile,
        type: 'multiple',
        validators: [
          function (data) {
            return true
          }
        ]
      },
      'userprofileimages': {
        action: addImageToProfile,
        type: 'multiple',
        validators: [
          function (data) {
            return true
          }
        ]
      },
      'userprofilelinks': {
        action: addLinkToProfile,
        type: 'multiple',
        validators: [function (data) {
          return true
        }]
      },
      'bids': {
        action: addBidToProfile,
        type: 'multiple',
        validators: [function (data) {
          return true
        }]
      },
      'flightrequests': {
        action: addFlightRequestToProfile,
        type: 'multiple',
        validators: [function (data) {
          return true
        }]
      },
      'flightgroups': {
        action: addFlightGroupToProfile,
        type: 'multiple',
        validators: [function (data) {
          return true
        }]
      },
      'hotels': {
        action: addHotelToProfile,
        type: 'multiple',
        validators: [function (data) {
          return true
        }]
      },
      'userprofile': {
        type: 'one',
        action: displayUserProfileInfo,
        validators: [function (data) {
          return true
        }]
      }
    }

    function displayDataEventHandler () {
      const _this = this

      console.log(_this)

      for (key in Object.getOwnPropertyNames(actionMapping)) {
        if (this[key] && actionMapping[key].type) {
          renderoProfile.apply(_this, this[key], actionMapping[key])
        } else {
          console.log('Did not find `this` property name for ' + key + ' not rendering as collection. ')
        }
      }
    }

    $.seatfilla = $.seatfilla || {}
    $.seatfilla.userprofile = $.seatfilla.userprofile || {}
    $.seatfilla.userprofile.loadProfile = function () {
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

          const resultsObj = {
            userprofile: results[0],
            userprofilecomments: results[1],
            userprofileimages: results[2],
            userprofilelinks: results[3],
            bids: results[4],
            flightRequests: results[5],
            flightGroups: results[6],
            hotels: results[7],
            notifications: results[8],
            user
          }

          if (!options.renderProfiles) {
            console.log('Render profiles is not defined')
            return
          }

          for (var key in options.renderProfiles) {
            if (!options.renderProfiles[key] || !Array.isArray(options.renderProfiles[key])) continue

            const arr = options.renderProfiles[key]
            arr.forEach(function (dataObj) {
              if (!dataObj.container) {
                console.log('No container associated with data profile for key : ' + key)
              }
              if ($.contains($(dataObj.container))) {
                $(dataObj.container).html('')
              }
            })
          }

          (function attachProfileMethods () {

            $.seatfilla.userprofile.sendUserProfileCommentToServer = function (parentId, message, callback) {
              if (parentId) {
                $.ajax({
                  data: {
                    message,
                    isReply: false,
                    user: 'loggedinuser'
                  },
                  url: '/userprofile/' + resultsObj.userprofile.id + '/comments',
                  success:function(data,ts,xhr){

                  },
                  error:function(){

                  }
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
                  error:function(){

                  }
                })
              }
            }

            $.seatfilla.userprofile.sendUserProfileLinkRequestToServer = function(){
              $.ajax({
                  url:'/userprofile/' + resultsObj.userprofile.id + '/userLinks',
                  data: {
                      user:'loggedinuser',
                      userprofile:resultsObj.userprofile.id
                  },
                  success:function(data,ts,xhr){

                  },
                  error:function(){

                  }
              })
            }

            //Complete this when know what data is being sent from the server
            $.seatfilla.userprofile.currentUserIsLink = function(cb){
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
          })()

          displayEventHandler.call(resultsObj)
        }).catch(function (err) {
          console.log(err)
        })
      })
    }

    function triggerAssociationAddedEventAction (action, dataObj, data) {
      if (!action || !dataObj || !data) {
        console.log('Invalid data object passed to triggerEventAction ')
      }

      function hasAction () {
        return dataObj[action] && typeof dataObj[action] === 'function'
      }

      function hasValidators () {
        return dataObj[action]
      }

      if (hasAction()) {
        // This may be an error later.. for now we'll just roll with it
        if (!hasValidators()) {
          console.log('Warning no validators for data ' + JSON.stringify(data) + ' are being passed when calling the associated action ' + action)
        }
        dataObj[action].call(null, data, dataObj[action].validators)
      } else {
        console.log('Data obj ' + JSON.stringify(dataObj) + ' in trigger event action does not have a valid action :' + action)
      }
    }

    function triggerAssociationEvent (associations, action, data) {
      if (associations && action && data && data.association) {
        associations[data.assocation.toLowerCase()].call(null, 'added', data)
      } else {
        consoel.log('Invalid data passed to trigger association event ' + JSON.stringify(arguments))
      }
    }

    /*
        Handle changes to a user profile
    */
    const userprofileEventHandlers = {
      associations: {
        comments: function (action, data) {},
        userlinks: function (action, data) {}
      },
      created: function (data) {},
      updated: function (data) {},
      addedTo: function (data) {},
      removedFrom: function () {}
    }

    /*
        Handle changes to the user profile links associated with this profile
    */
    const userprofilelinkEventListeners = {
      associations: {},
      created: function (data) {},
      destroyed: function () {},
      updated: function () {},
      addedTo: function () {},
      removedFrom: function () {}
    }

    /*
        Handle changes to the user profile links associated with this profile
    */
    const userprofileimageEventListeners = {
      associations: {},
      created: function (data) {},
      destroyed: function () {},
      updated: function () {},
      addedTo: function () {},
      removedFrom: function () {}
    }

    /*
        Handle changes to the user profile comments associated with this profile
    */
    const userprofilecommentEventListeners = {
      associations: {},
      created: function (data) {
        console.log('Created user profile comment ' + JSON.stringify(data))
      },
      destroyed: function () {},
      updated: function () {},
      addedTo: function () {},
      removedFrom: function () {}
    }

    /*
        Handle changes to the user profile comments associated with this profile
    */
    const flightRequestEventListeners = {
      associations: {},
      created: function (data) {},
      destroyed: function () {},
      updated: function () {},
      addedTo: function () {},
      removedFrom: function () {}
    }

    /*
    Handle changes to the user profile comments associated with this profile
    */
    const flightGroupEventListeners = {
      associations: {

      },
      created: function (data) {},
      destroyed: function () {},
      updated: function () {},
      addedTo: function () {},
      removedFrom: function () {}
    }

    /*
    Handle changes to the user profile comments associated with this profile
    */
    const hotelEventListeners = {
      associations: {
        hotelusercomments: function (action, data) {
          console.log('(Hotel user comments): action: ' + action + ' data: ' + JSON.stringify(data))
        },
        hoteluserratings: function (action, data) {
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
      addedTo: function (data) {
        // hotelUserComments
        // hotelUserRating
        triggerAssociationEvent(this.associations, 'added', data)
      },
      removedFrom: function (data) {
        triggerAssociationEvent(this.associations, 'removed', data)
      }
    }
    /*
        Handle changes to the user profile comments associated with this profile
    */
    const userEventListeners = {
      associations: {
        hotels: function (action, data) {
          triggerAssociationAddedEvent(action, {
            'added': {
              action: addHotelToProfile,
              validators: actionMapping.bids.validators
            },
            'removed': {
              action: removeBidFromProfile,
              validator: actionMapping.bids.validators
            }
          }, data)
        },
        images: function (action, data) {
          triggerAssociationAddedEvent(action, {
            'added': {
              action: addImageToProfile,
              validators: actionMapping.bids.validators
            },
            'removed': {
              action: removeImageFromProfile,
              validator: actionMapping.bids.validators
            }
          }, data)
        },
        bids: function (action, data) {
          triggerAssociationAddedEvent(action, {
            'added': {
              action: addBidToProfile,
              validators: actionMapping.bids.validators
            },
            'removed': {
              action: removedBidFromProfile,
              validator: actionMapping.bids.validators
            }
          }, data)
        },
        flightRequests: function (action, data) {
          triggerAssociationAddedEvent(action, {
            'added': {
              action: addFlightRequestToProfile,
              validators: actionMapping.flightRequests.validators
            },
            'removed': {
              action: removedFlightRequestFromProfile,
              validator: actionMapping.flightRequests.validators
            }
          }, data)
        },
        flightGroups: function (action, data) {
          triggerAssociationAddedEvent(action, {
            'added': {
              action: addFlightRequestToProfile,
              validators: actionMapping.flightGroups.validators
            },
            'removed': {
              action: removedFlightRequestFromProfile,
              validator: actionMapping.flightGroups.validators
            }
          }, data)
        },
        notifications: function (action, data) {
          triggerAssociationAddedEvent(action, {
            'added': {
              action: addNotificationToProfile,
              validators: actionMapping.notifiations.validators
            },
            'removed': {
              action: removedNotificationFromProfile,
              validator: actionMapping.notifications.validators
            }
          }, data)
        }
      },
      // Ignored, triggered when a user is created
      created: function (data) {},
      // Ignored, triggered when a user is destroyed
      destroyed: function (data) {
        $.toaster({ priority: 'info', message: 'This profile is not longer active' })
      },
      updated: function (data) {
        $.toaster({ priority: 'info', message: 'This profile users info has been updated' })
      },
      addedTo: function (data) {
        const _this = this
        triggerAssociationEvent(this.associations, 'added', data)
      },
      removedFrom: function (data) {
        const _this = this
        console.log('User removed from ' + JSON.stringify(data))
        triggerAssociationEvent(this.associations, 'removed', data)
      }
    }

    const _this = this
    ;(function attachWebSocketListeners () {
      const handleEvent = function (data) {
        const eventType = this.eventType
        console.log('Recieved event type ' + eventType + ' with data ' + JSON.stringify(data))

        if (!eventType || !data || !data.verb || !(_this[eventType + 'EventListeners']) || !(_this[eventType + 'EventHandlers'][data.verb])) {
          console.log('In attach web socket listeners: could not find eventListener for: ' + eventType)
          return
        }

        _this[eventType + 'EventListeners'][data.verb].call(null, data)
      }

      io.socket.on('userprofile', handleEvent.bind({
        eventType: 'userprofile'
      }))

      io.socket.on('userprofileimage', handleEvent.bind({
        eventType: 'userprofileimage'
      }))

      io.socket.on('userprofilelink', handleEvent.bind({
        eventType: 'userprofilelink'
      }))

      io.socket.on('userprofilecomment', handleEvent.bind({
        eventType: 'userprofilecomment'
      }))

      io.socket.on('flightrequest', handleEvent.bind({
        eventType: 'flightRequest'
      }))

      io.socket.on('flightgroup', handleEvent.bind({
        eventType: 'flightgroup'
      }))

      io.socket.on('hotel', handleEvent.bind({
        eventType: 'hotel'
      }))

      io.socket.on('user', handleEvent.bind({
        eventType: 'user'
      }))
    })()
  })($, window.io, {
    renderProfiles: {
      userProfileFlightRequests: [{
        template: 'flightRequestTemplate',
        container: 'flightRequestContainer'
      }],
      userProfileLinks:[{
        template: 'userProfileLinkTemplate',
        container: 'userProfileLinkContainer'
      }],
      userProfileFlightGroups: [{
        template: 'flightGroupTemplate',
        container: 'flightGroupContainer'
      }],
      userProfileBids: [{
        template: 'bidTemplate',
        container: 'bidContainer'
      }],
      userProfileHotels: [{
        template: 'hotelTemplate',
        container: 'hotelContainer'
      }],
      userProfileComments: [{
        template: 'commentTemplate',
        container: 'commentContainer'
      }],
      userProfileCommentReplies: [{
        template: 'commentReplyTemplate',
        find:function(data){
          console.log('Find the container for a user comment profile reply');
        }
      }],
      userProfileImages: [{
        template: 'userProfileImagesTemplate',
        container: 'userProfileImageContainer'
      }]
    }
  })
})
