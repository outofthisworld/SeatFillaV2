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

    function socketEventHandler () {

      const user = ,
            userprofile,
            userprofilecomments,
            userprofileimages,


      console.log('Current user:')
      console.log(user)
      console.log('Current user profile:')
      console.log(userprofile)


      displayUserProfileInfo(user,userprofile)
      displayLatestFlightRequests(user,userprofile);
      displayLatestFlightGroups(user,userprofile);
      displayLatestBids(user,userprofile);
      displayLatestNotifications(user,userprofile);


      /*

      */


      /*
        Listen for user interface interactions
      */
      bindDomCommentEventListener(userprofile)
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

        const responseHandler = function(data,jwRes){
            const resolve = this.resolve;
            const reject = this.reject;

            if(jwRes.statusCode != 200)
                    return reject(new Error(''));

            return resolve(userprofile)
        }

        Promise.all([
            new Promise(function(resolve,reject){
                io.socket.get('/userprofile/' + user.username, responseHandler.bind({resolve,reject}))
            }),
            new Promise(function(resolve,reject){
                 io.socket.get('/userprofilecomment?user=' + user.id, responseHandler.bind({resolve,reject}))
            }),
            new Promise(function(resolve,reject){
                io.socket.get('/userprofileimage?user='+user.id, responseHandler.bind({resolve,reject}))
            }),
             new Promise(function(resolve,reject){
                io.socket.get('/userprofilelink?user='+user.id, responseHandler.bind({resolve,reject}))
            }),
            new Promise(function(resolve,reject){
                 io.socket.get('/bids?user='+user.id, responseHandler.bind({resolve,reject}))
            }),
            new Promise(function(resolve,reject){
                 io.socket.get('/flightRequest?user='+user.id, responseHandler.bind({resolve,reject}))
            }),
            new Promise(function(resolve,reject){
                io.socket.get('/flightGroup?user='+user.id, responseHandler.bind({resolve,reject}))
            }),
            new Promise(function(resolve,reject){
                io.socket.get('/hotel?user='+user.id, responseHandler.bind({resolve,reject}))
            })
        ]).then(function(results){

            socketEventHandler.apply({
                userprofile:results[0],
                userprofilecomments:results[1],
                userprofileimages:results[2],
                userprofilelinks:results[3],
                bids:results[4]
            })

        }).catch(function(err){

        })
    })


    /*
        Handle changes to a user profile
    */
    const userprofileEventHandlers = {
        created: function (data) {

        },
        updated: function (data) {

        },
        addedTo: function (data) {

        },
        removedFrom: function () {

        }
    }

    /*
        Handle changes to the user profile links associated with this profile
    */
    const userprofilelinkEventHandlers = {
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
        Handle changes to the user profile links associated with this profile
    */
    const userprofileimageEventListeners = {
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
    const userprofilecommentEventListeners = {
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
    const userprofilelinkEventListeners = {
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
    const flightRequestEventListeners = {
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
    const flightGroupEventListeners = {
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
    const userEventListeners = {
        destroyed: function () {

        },
        updated: function () {

        },
        addedTo: function () {

        },
        removedFrom: function () {
            
        }
    }

    const _this = this;

    

    (function attachWebSocketListeners(){

        const handleEvent = function(data){
            const eventType = this.eventType;
            if(!eventType || !data || !data.verb || !(_this[eventType+'EventHandlers']) || !(_this[eventType+'EventHandlers'][data.verb])) return;
            _this[eventType+'EventHandlers'][data.verb].call(null,data);
        }

        io.socket.on('userprofile',socketOnHandler.bind({eventType:'userprofile'}))

        io.socket.on('userprofileimage', socketOnHandler.bind({eventType:'userprofileimage'}))

        io.socket.on('userprofilelink', socketOnHandler.bind({eventType:'userprofilelink'}))

        io.socket.on('userprofilecomment', socketOnHandler.bind({eventType:'userprofilecomment'}))

        io.socket.on('flightrequest', socketOnHandler.bind({eventType:'flightRequest'}))

        io.socket.on('flightgroup', socketOnHandler.bind({eventType:'flightgroup'}))

        io.socket.on('hotel', socketOnHandler.bind({eventType:'hotel'}))

        io.socket.on('user', socketOnHandler.bind({eventType:'user'}))

    })();
  })($,window.io, {

  })
})
