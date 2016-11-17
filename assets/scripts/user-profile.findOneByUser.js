$(document).ready(function () {
  (function ($,io, options) {
    if (!io) throw new Error('Could not find dependency IO.')

    const currentUserProfileUser = window.seatfilla.globals.userprofile.getCurrentUserProfileUser(window.location.pathname)
    if (!currentUserProfileUser) return

    console.log('Current viewing user profile for :' + currentUserProfileUser)

    function loadAndRenderTemplate(options){
        const containerId = options.containerId,
            containerAction = options.containerAction,
            templateId = options.templateId,
            data = options.data;

        if(!containerId || !containerAction || !templateId || !data) return;

        const $container = $(containerId);
        const template = $.templates(templateId);
        if(!template || !$container || $container[containerAction] || ! typeof $container[containerAction] === 'function') return;

        if(!data) return;

        const html = template.render(data);
        $container[containerAction](data);
    }


    function addFlightRequestToProfile(data){
        loadAndRenderTemplate({
            containerId:options.userProfileFlightRequestsContainerId,
            containerAction:'append',
            templateId:options.userProfileFlightRequestsTemplateId,
            data
        })
    }

    function addFlightGroupToProfile(data){
         loadAndRenderTemplate({
            containerId:options.userProfileFlightGroupContainerId,
            containerAction:'append',
            templateId:options.userProfileFlightGroupTemplateId,
            data
        })
    }

    function addBidToProfile(data){
         loadAndRenderTemplate({
            containerId:options.userProfileBidsContainerId,
            containerAction:'append',
            templateId:options.userProfileBidsTemplateId,
            data
        })
    }

    function addHotelToProfile(data){
         loadAndRenderTemplate({
            containerId:options.userProfileHotelContainerId,
            containerAction:'append',
            templateId:options.userProfileHotelTemplateId,
            data
        })
    }

    function addCommentToProfile(data){
         loadAndRenderTemplate({
            containerId:options.userProfileCommentContainerId,
            containerAction:'append',
            templateId:options.userProfileCommentTemplateId,
            data
        })
    }

    function displayUserProfileInfo(data){
        loadAndRenderTemplate({
            containerId:options.userProfileInfoContainerId,
            containerAction:'html',
            templateId:options.userProfileInfoTemplateId,
            data
        })
    }

    function renderCollection(arr,callback){
        if(!arr || !arr.length) return;

        arr.forEach(function(arrItem){
            callback(arrItem);
        })
    }

    function displayLatestFlightGroups(user,userprofile){
        renderCollection(user.flightGroups, addFlightGroupToProfile)
    }

    function displayLatestHotels(user,userprofile){
        renderCollection(user.hotels, addHotelToProfile)
    }

    function displayLatestBids(user,userprofile){
        renderCollection(user.bids, addBidToProfile)
    }

    function displayLatestFlightRequests(user,userprofile){
        renderCollection(user.flightRequests, addFlightRequestToProfile)
    }

    function displayLatestNotifications(user,userprofile){
        renderCollection(user.notifications,addNotificationToProfile)
    }

    function displayProfileComments(user,userprofile){
        renderCollection(userprofile.comments,addProfileComment);
    }

    function socketEventHandler (user,userprofile) {
    
      if(!user || !userprofile) {
          window.location.href= '/'
      }

      console.log('Current user:')
      console.log(user)
      console.log('Current user profile:')
      console.log(userprofile)


      displayUserProfileInfo(user,userprofile)
      displayLatestFlightRequests(user,userprofile);
      displayLatestFlightGroups(user,userprofile);
      displayLatestBids(user,userprofile);
      displayLatestNotifications(user,userprofile);

      addCommentEventListener(userprofile)
    }

    function addCommentEventListener (userprofile) {
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
            }else {
                $.ajax({
                data: {
                    message: $commentBox.val(),
                    isReply: true
                },
                url: '/userprofilecomment/' + id + '/userprofilecomment',
                success: function (response, ts, xhr) {
                    if (xhr.status == 200 && response) {
                       console.log('Response adding comment ' + JSON.stringify(response));
                    }else {
                       console.log('Error adding comment')
                    }
                }
                })
            }
          }else{
             $.toaster({priority:'info',message:'Please login in to complete this action'})
          }
        })
      })
    }

    io.socket.get('/user?username=' + currentUserProfileUser, function (user,jwRes) {
        if(!user) return;
        if(Array.isArray(user) && !user.length) return;
        if(Array.isArray(user)) user = user[0];

        if(jwRes.statusCode != 200){
            alert('Invalid response from server');
            window.location.href = '/';
        }
       io.socket.get('/userprofile/' + user.username, function(userprofile,jwRes){
           if(jwRes.statusCode != 200){
               alert('Invalid response form server')
               window.location.href= '/'
           }
           if(!options) return;
           socketEventHandler(user, userprofile);
       })
    })


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
        Handle changes to the user associated with this profile
    */
    const profileuserEventHandlers = {
        destroyed: function () {},
        updated: function () {},
        addedTo: function () {
        },
        removedFrom: function () {}
    }

    const _this = this;
    const handleEvent = function(eventType,data){
        if(!eventType) return;
        if(_this[eventType+'EventHandlers'])
            _this[eventType+'EventHandlers'].call(null,data);
    }

    io.socket.on('userprofile', function (response) {
      console.log('in user profile userprofile listener: ' + JSON.stringify(response))
      if (!response.verb) return;
      handleEvent('userprofile',response);
    })

    io.socket.on('user', function (response) {
      console.log('in user profile user listener: ' + JSON.stringify(response))
      if (!response.verb) return;
      handleEvent('profileuser',response);
    })
  })($,window.io, {

  })
})
