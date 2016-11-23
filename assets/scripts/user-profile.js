$(window).ready(function () {
  const currentUserProfileUser = window.seatfilla.globals.userprofile.getCurrentUserProfileUser(window.location.pathname)
  if (!currentUserProfileUser) return


  /*
      Loads the user that this profile currently belongs to.
  */
  io.socket.get('/user?username=' + currentUserProfileUser, function (user, jwRes) {
    
    (function(){
      if (!user) return
      if (Array.isArray(user) && !user.length) return
      if (Array.isArray(user)) user = user[0]

      if (jwRes.statusCode != 200) {
        alert('Invalid response from server')
        window.location.href = '/'
      }
    })()
   
    /*
      Extend jQuery and add own namespace.
    */
    $.seatfilla = $.seatfilla || {}
    $.seatfilla.userprofile = $.seatfilla.userprofile || {}

    /*
        Constructs a new SocketDataLoaderObject, which loads
        data intially from the socket and then, if set, uses
        dom reactor for listening to socket events.

        The dom reactor has generic methods for `create` `update` `destroyed`
        `loadedFromSocket` which can be overridden by the object passed to this function.
    */
    $.seatfilla.userprofile.dataLoader = $.SocketDataLoader({
      domReactor:true,
      targets: [
      {
      eventName: 'userprofilecommentreply',
      shouldListen:true,
      renderOpts: {
        /*
          Max number of user profile comments to be displayed before triggering a removal 
        */
        maxDomElements: 5,
        template: '#userprofilecommentreplytemplate',
        /*
          Finds the container for this comment
        */
        container: function(data){
          const parentCommentId = data.id;
          const container = $('#userprofilecommentcontainer')
          .find('li[data-attr-id="'+parentCommentId+'"] .userprofilecommentreplies')
          return container;
        },
      }
     },
     {
      eventName: 'userprofilecomment',
      path: '/userprofilecomment?userProfile='+(1).toString()+'&isReply=false&sort=createdAt DESC',
      shouldListen:true,
      /*
        Handles associations,
        If an `addedTo` or `removedFrom` event occurs
      */
      addedto: {
        replies: {
          event: 'userprofilecommentreply'
        }
      },
      removedfrom: {
        replies: {
          event: 'userprofilecommentreply'
        }
      },
      /*
        Validators for a `updated`, `created` or `destroyed` comment.
        Validators are callback functions for when an event is triggered by the dom reactor.
        Data is passed to the validators based on the type of event, if all validators for a particular event
        return true then the data will be rendered, otherwise the data will not be added to the DOM.
      */
      validators:{
        created:[
          /*
            Validates that the correct information is within the data
            before it gets rendered, and also ensures it is a top level comment.

            Due to the nature of sails.js, the publishCreate event `create` will be triggered
            for a comment whether or not it is a comment reply.
          */
          function validateTopLevelComment(data){
            if(data && !data.isReply && data.user) return true;
            else return false;
          }
        ]
      },
        renderOpts: {
          /*
            The max number of DOM elements to hold within a container
            If a `publish create` event occurs and the number of DOM elements
            exceeds this amount, the dom reactor will automatically
            remove the last child of the container. 
          */
          maxDomElements: 5,
          /*
            The way in which elements should be appended to the dom, any valid
            Jquery function, if this needs to be changed to something more specific
            a callback can be used instead under the property `addToDom`
            which will then be responsible for adding the data to the container.
          */
          renderMethod:'prepend',
          /*
            The way in which child elements will be removed from the DOM
            upon a new element being created and maxDomElements being exceeded.
          */
          childRemovalMethod:'last',

          /*
            The types of effects to be applied to this DOM element 
          */
          removeEffect:['fadeOut',1000],
          updateEffect:[],
          createEffect:[],
          /*
            The template and container for this type of event.
          */
          template: '#userprofilecommenttemplate',
          container: '#userprofilecommentcontainer',
          /*
            Hooks the dynamically generated form before it is created 
            and applies ajaxForm to it, so that it will be posted via AJAX.
          */
          beforeCreate:function($html){
            $html.find('.replyForm').ajaxForm($.ajaxFormHandler({
                errorMessage:'Reply not recorded',
                successMessage:'Successfully replied to comment'
            }))
          }
        }
      }
      ],
      /*
        If a problem occurs when loading data from a socket, catch and display the error to the console 
        here.
      */
      onError: function (err) {
        console.log(err)
      }
    })


    /*
      On `load` event for when the data is first loaded by the SocketDataLoader.
      The event is triggered and `this` refers to the data that has been loaded from
      the socket.

      Because we have full access to data returned from the SocketDataLoader within this event,
      it is a useful place to add extensions which can be used to operate on the returned data. 
    */
    $.seatfilla.userprofile.dataLoader.on('load', function () {
      const responseData = this
     

      /*
        Sends a user profile link request to the server.
      */
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

      /*
        Returns true via a CB if this is the users own profile.
        callback is required due the getUser being asnychronous.
      */
      $.seatfilla.userprofile.isOwnProfile = function (cb) {
        window.seatfilla.globals.getUser(function (status, result) {
          if (status == 200 && result && result.username && result.username == currentUserProfileUser) {
            return cb(true)
          } else {
            return cb(false)
          }
        })
      }

      /*
        Returns all data about a users profile.
      */
      $.seatfilla.userprofile.getProfileInfo = function () {
        return responseData
      }

      /*
        Calls back the specified callback in order to extend $.seatfilla.userprofile.
      */
      $.seatfilla.userprofile.configure = function (callback) {
        if (callback && typeof callback == 'function') callback.call($.seatfilla.userprofile)
      }
    })

     /*
      Loads and listens for socket events.
     */
     $.seatfilla.userprofile.dataLoader.loadAndListen()
  })
})
