$(window).ready(function () {
  (function ($, io, options) {
    if (!io) throw new Error('Could not find dependency IO.')

    const currentUserProfileUser = window.seatfilla.globals.userprofile.getCurrentUserProfileUser(window.location.pathname)
    if (!currentUserProfileUser) return

    console.log('Current viewing user profile for :' + currentUserProfileUser)

    function loadAndRenderTemplate (options) {
      function loadTemplate () {
        console.log('Loading template with options: ' + JSON.stringify(options))

        const containerId = options.containerId,
          containerAction = options.containerAction,
          templateId = options.templateId,
          data = options.data

        if (!containerId || !containerAction || !templateId || !data) return

        const $container = $(containerId)
        const template = $.templates(templateId)
        if (!template || !$container || $container[containerAction] || !typeof $container[containerAction] === 'function') return

        if (!data) return

        const html = template.render(data)
        $container[containerAction](data)
      }

      if (document.readyState != 'loading') {
        loadTemplate()
      } else {
        $(document).ready(loadTemplate)
      }
    }

    /*
      Applies validators to user profile data before being displayed.
      This can be used for example to confirm that triggered socket events
      belong to this profile, and that the data is not malformed.
    */
    const validateProfileData = function (data, validators) {
      var _validData = true
      const collectionValidators = validators

      if (!collectionValidators || !Array.isArray(collectionValidators))
        console.log('Collection validators was null for : ' + JSON.stringify(data))

      function triggerValidator (func, thisArg, args) {
        if (!typeof func === 'function') {
          console.log('Invalid function passed to trigger validator')
          return
        }
        return func.apply(thisArg, args)
      }

      if (collectionValidators != null && typeof collectionValidators[Symbol.iterator] === 'function') {
        for (var i in Object.getOwnPropertyNames(collectionValidators)) {
          const validator = collectionValidators[i]
          triggerValidator(validator, null, [data])
        }
      }else if (Array.isArray(collectionValidators)) {
        for (var i = 0; i < collectionValidators.length; i++) {
          const validator = collectionValidators[i]
          if (typeof validator === 'function') {
            _validData = triggerValidator(validator, null, [data])
          }
          // Early return 
          if (!_validData) break
        }
      }else {
        console.log('Invalid validators type passed to validate profile data ')
      }

      return _validData
    }

    function addFlightRequestToProfile (data, validators) {
      if (validateProfileData.call(data, validators)) {
        loadAndRenderTemplate({
          containerId: options.userProfileFlightRequestsContainerId,
          containerAction: 'append',
          templateId: options.userProfileFlightRequestsTemplateId,
        data})
      }else {
      }
    }

    function addFlightGroupToProfile (data, validators) {
      if (validateProfileData.call(data, validators)) {
        loadAndRenderTemplate({
          containerId: options.userProfileFlightGroupContainerId,
          containerAction: 'append',
          templateId: options.userProfileFlightGroupTemplateId,
        data})
      }else {
      }
    }

    function addBidToProfile (data, validators) {
      if (validateProfileData(data, validators)) {
        loadAndRenderTemplate({
          containerId: options.userProfileBidsContainerId,
          containerAction: 'append',
          templateId: options.userProfileBidsTemplateId,
        data})
      }else {
      }
    }

    //Hotel created, user hotels addedTo
    function addHotelToProfile (data, validators) {
      if (validateProfileData(data, validators)) {
        loadAndRenderTemplate({
          containerId: options.userProfileHotelContainerId,
          containerAction: 'append',
          templateId: options.userProfileHotelTemplateId,
        data})
      }else {
      }
    }

    //UserProfileComment created, userprofile addedTo
    function addCommentToProfile (data, validators) {
      if (validateProfileData(data, validators)) {
        loadAndRenderTemplate({
          containerId: options.userProfileCommentContainerId,
          containerAction: 'append',
          templateId: options.userProfileCommentTemplateId,
        data})
      }else {
      }
    }

    //UserProfileComments addedTo
    function addCommentReplyToProfile (data, validators) {
      if (validateProfileData(data, validators)) {
        loadAndRenderTemplate({
          containerId: options.userProfileCommentContainerId,
          containerAction: 'append',
          templateId: options.userProfileCommentTemplateId,
        data})
      }else {
        console.log('Not rendering comment')
      }
    }

    function addImageToProfile(data,validators){
      if (validateProfileData(data, validators)) {
        loadAndRenderTemplate({
          containerId: options.userProfileImageContainerId,
          containerAction: 'append',
          templateId: options.userProfileImageTemplateId,
        data})
      }else {
        console.log('Not rendering comment')
      }
    }

    function renderCollectionToProfile (arr, obj) {
      if (!arr || !arr.length) return

      const _this = this

      if (!obj) return

      const collectionAction = obj.action

      if (!collectionAction) {
        console.log('Attempted to render collection without collection action for key ' + key)
        return
      }else if (!typeof collectionAction == 'function') {
        console.log('Invalid action for key ' + key)
      }

      collection.forEach(function (arrItem) {
        collectionAction.apply(_this, [arrItem, obj.validators])
      })
    }

    function displayUserProfileInfo (data, validators) {
      if (this.validateProfileData(data, validators)) {
        loadAndRenderTemplate({
          containerId: options.userProfileInfoContainerId,
          containerAction: 'html',
          templateId: options.userProfileInfoTemplateId,
        data})
      }else {
      }
    }

    const actionMapping = {
      'userprofilecomments': {
        action: addCommentToProfile,
        validators: [
          function (data) {
            return true
          }
        ]
      },
      'userprofileimages': {
        action: addImageToProfile,
        validators: [
          function (data) {
            return true
          }
        ]
      },
      'userprofilelinks': {
        action: addLinkToProfile,
        validators: [function (data) {
          return true
        }]
      },
      'bids': {
        action: addBidToProfile,
        validators: [function (data) {
          return true
        }]
      },
      'flightRequests': {
        action: addFlightRequestToProfile,
        validators: [function (data) {
          return true
        }]
      },
      'flightGroups': {
        action: addFlightGroupToProfile,
        validators: [function (data) {
          return true
        }]
      },
      'hotels': {
        action: addHotelToProfile,
        validators: [function (data) {
          return true
        }]
      },
      'userprofileinfo': {
        validators: []
      }
    }
    function socketEventHandler () {
      const _this = this

      console.log(_this)

      _this.getUserProfile = function () {
        return _this.userprofile
      }

      _this.getUserProfileId = function () {
        return _this.userprofile.id
      }

      _this.getUserProfileUsername = function () {
        return _this.user.id
      }

      _this.getUserProfileComments = function () {
        return _this.userprofilecomments
      }

      _this.getUserProfileImages = function () {
        return _this.userprofileimages
      }

      _this.getBids = function () {
        return _this.bids
      }

      _this.getFlightRequests = function () {
        return _this.flightRequests
      }

      _this.geFlightGroups = function () {
        return _this.flightGroups
      }

      _this.getHotels = function () {
        return _this.hotels
      }

      _this.getUser = function () {
        return _this.user
      }

      displayUserProfileInfo('userprofileinfo', this)
      for (key in Object.getOwnPropertyNames(actionMapping)) {
        if (this[key])
          renderCollectionToProfile.apply(_this, this[key], actionMapping[key])
        else
          console.log('Did not find `this` property name for ' + key + ' not rendering as collection. ')
      }

      /*
        Listen for user interface interactions
      */
      bindDomCommentEventListener.call(this)
    }

    function bindDomCommentEventListener (userprofile) {
      window.seatfilla.globals.getUser(function (status, user) {
        $(options.commentsForm).submit(function () {
          if (status == 200 && user && user.status == 200) {
            const $commentBox = $(this).find(options.commentBox)
            const id = $(this).attr('data-attr-parent-commentId')
            if (!id) {
              $.ajax({
                data: {
                  message: $commentBox.val(),
                  isReply: false
                },
                url: '/userprofile/' + userprofile.id + '/userprofilecomment'
              })
            } else {
              $.ajax({
                data: {
                  message: $commentBox.val(),
                  isReply: true
                },
                url: '/userprofilecomment/' + id + '/userprofilecomment',
                success: function (response, ts, xhr) {
                  if (xhr.status == 200 && response) {
                    console.log('Response adding comment ' + JSON.stringify(response))
                  } else {
                    console.log('Error adding comment')
                  }
                }
              })
            }
          } else {
            $.toaster({
              priority: 'info',
              message: 'Please login in to complete this action'
            })
          }
        })
      })
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
        })
      ]).then(function (results) {
        socketEventHandler.apply({
          userprofile: results[0],
          userprofilecomments: results[1],
          userprofileimages: results[2],
          userprofilelinks: results[3],
          bids: results[4],
          flightRequests: results[5],
          flightGroups: results[6],
          hotels: results[7],
        user})
      }).catch(function (err) {
        console.log(err)
      })
    })





    function triggerAssociationAddedEventAction(action,dataObj,data){
        if(!action || !dataObj || !data){
            console.log('Invalid data object passed to triggerEventAction ')
        }
        function hasAction(actionStr){
            return dataObj[actionStr] && typeof dataObj[actionStr] === 'function'
        }
        
         if(hasAction(action)){
                dataObj[action].call(null,data);
            }else{
                console.log('Data obj ' + JSON.stringify(dataObj) + ' in trigger event action does not have a valid action :' + action)
            }
    }

    function triggerAssociationEvent(associations,action,data){
        if(associations && action && data && data.association){
              associations[data.assocation].call(null,'added',data);
        }else{
            consoel.log('Invalid data passed to trigger association event ' + JSON.stringify(arguments));
        }
    }

    /*
        Handle changes to a user profile
    */
    const userprofileEventHandlers = {
      created: function (data) {},
      updated: function (data) {},
      addedTo: function (data) {},
      removedFrom: function () {}
    }

    /*
        Handle changes to the user profile links associated with this profile
    */
    const userprofilelinkEventHandlers = {
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
      created: function (data) {},
      destroyed: function () {},
      updated: function () {},
      addedTo: function () {},
      removedFrom: function () {}
    }

    /*
    Handle changes to the user profile comments associated with this profile
    */
    const userprofilelinkEventListeners = {
      created: function (data) {},
      destroyed: function () {},
      updated: function () {},
      addedTo: function () {},
      removedFrom: function () {}
    }

    /*
        Handle changes to the user profile comments associated with this profile
    */
    const flightRequestEventListeners = {
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
      created: function (data) {

      },
      destroyed: function () {

      },
      updated: function () {

      },
      addedTo: function () {

      },
      removedFrom: function () {

      }
    }

    /*
    Handle changes to the user profile comments associated with this profile
    */
    const hotelEventListeners = {
      associations:{

      },
      created: function (data) {

      },
      destroyed: function (data) {

      },
      updated: function (data) {

      },
      addedTo: function (data) {
       // hotelUserComments;
        //hotelUserRating;
      },
      removedFrom: function (data) {

      }
    }
    /*
        Handle changes to the user profile comments associated with this profile
    */
    const userEventListeners = {
      associations:{
          'hotels': function(action,data){
              triggerAssociationAddedEvent(action,{
                  'added':{
                      action:addHotelToProfile,
                      validators:actionMapping.bids.validators
                  },
                  'removed':{
                      action:removeBidFromProfile,
                      validator:actionMapping.bids.validators
                  }
              },data);
          },
          'images': function(action,data){
              triggerAssociationAddedEvent(action,{
                  'added':{
                      action:addImageToProfile,
                      validators:actionMapping.bids.validators
                  },
                  'removed':{
                      action:removeImageFromProfile,
                      validator:actionMapping.bids.validators
                  }
             },data);
          },
          bids:function(action,data){
              triggerAssociationAddedEvent(action,{
                  'added':{
                      action:addBidToProfile,
                      validators:actionMapping.bids.validators
                  },
                  'removed':{
                      action:removedBidFromProfile,
                      validator:actionMapping.bids.validators
                  }
              },data);
          },
          flightRequests:function(action,data){
              triggerAssociationAddedEvent(action,{
                  'added':{
                      action:addFlightRequestToProfile,
                      validators:actionMapping.flightRequests.validators
                  },
                  'removed':{
                      action:removedFlightRequestFromProfile,
                      validator:actionMapping.flightRequests.validators
                  }
              },data);
          },
          flightGroups:function(action,data){
             triggerAssociationAddedEvent(action,{
                  'added':{
                      action:addFlightRequestToProfile,
                      validators:actionMapping.flightGroups.validators
                  },
                  'removed':{
                      action:removedFlightRequestFromProfile,
                      validator:actionMapping.flightGroups.validators
                  }
              },data);
          },
          notifications:function(action,data){
              triggerAssociationAddedEvent(action,{
                  'added':{
                      action:addNotificationToProfile,
                      validators:actionMapping.notifiations.validators
                  },
                  'removed':{
                      action:removedNotificationFromProfile,
                      validator:actionMapping.notifications.validators
                  }
              },data);
          }
      },
      //Ignored, triggered when a user is created
      created: function (data) {},
      //Ignored, triggered when a user is destroyed
      destroyed: function (data) {
          $.toaster({priority:'info',message:'This profile is not longer active'});
      },
      updated: function (data) {
        $.toaster({priority:'info',message:'This profile users info has been updated'});
      },
      addedTo: function (data) {
          const _this = this;
          triggerAssociationEvent(this.associations,'added',data);
      },
      removedFrom: function (data) {
          const _this = this;
          console.log('User removed from ' + JSON.stringify(data));
          triggerAssociationEvent(this.associations,'removed',data);
      }
    }

    const _this = this
    (function attachWebSocketListeners () {
      const handleEvent = function (data) {
        const eventType = this.eventType
        console.log('Recieved event type ' + eventType + ' with data ' + JSON.stringify(data))
        if (!eventType || !data || !data.verb || !(_this[eventType + 'EventHandlers']) || !(_this[eventType + 'EventHandlers'][data.verb])) return
        _this[eventType + 'EventHandlers'][data.verb].call(null, data)
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

  })
})
