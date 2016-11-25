$(window).ready(function () {
  (function ($, io) {
    const currentUserProfileUser = window.seatfilla.globals.userprofile.getCurrentUserProfileUser(window.location.pathname)

    const handleProfileError = function (err) {
      console.log(err)
    }

    if (!currentUserProfileUser) handleProfileError(new Error('Could not find profile user'))

    const obtainCurrentProfileUser = function () {
      return new Promise(function (resolve, reject) {
        io.socket.get('/user?username=' + currentUserProfileUser, function (user, jwRes) {
          if (jwRes.statusCode == 200 && user) {
            if (Array.isArray(user)) {
              if (!(user.length)) return reject(new Error('Could not find current profile user'))

              user = user[0]

              // Make sure that the first element wasn't null
              if (!user) return reject('Profile user was null')
            }
            return resolve(user)
          } else {
            return reject(new Error('Current profile user not found'))
          }
        })
      })
    }

    const obtainCurrentUser = function () {
      return new Promise(function (resolve, reject) {
        window.seatfilla.globals.getUser(function (status, result) {
          if (status == 200 && result && result.username) {
            return resolve(result)
          } else {
            return resolve(null)
          }
        })
      })
    }

    const attachExternalFunctions = function (currentProfileUser, user) {
      if (!currentProfileUser) throw new Error('Invalid params')

      /*
        Sends a user profile link request to the server.
      */
      $.seatfilla.userprofile.sendUserProfileLinkRequestToServer = function () {
        $.ajax({
          url: '/userprofile/' + currentProfileUser.userProfile.id + '/userLinks',
          data: {
            user: 'loggedinuser',
            userprofile: user.userProfile.id
          },
          success: function (data, ts, xhr) {},
          error: function () {}
        })
      }

      // Complete this when know what data is being sent from the server
      $.seatfilla.userprofile.currentUserIsLink = function () {
        if (!user || !user.userProfile.userLinks.find(function (link) { link.user == currentProfileUser.id })) return false
        return true
      }

      /*
        Returns true via a CB if this is the users own profile.
        callback is required due the getUser being asnychronous.
      */
      $.seatfilla.userprofile.isOwnProfile = function (cb) {
        if (!user || currentProfileUser.id != user.id) return false
        return true
      }
    }

    const attachDomReactor = function (currentProfileUser, user) {
      if (!currentProfileUser) throw new Error('Invalid params')

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
      $.seatfilla.userprofile.dataLoader = $.domReactor({
        domReactor: true,
        targets: [

        /*
          Notification target
        */
        {
          /*
            The event name for this target
          */
          eventName: 'notifications',
          /*
            True if we should listen for incoming socket events under this event name.
          */
          shouldListen: true,
          /*
            The path to load notifications
          */
          path: '/notifications',
          /*
            Find query string
          */
          where: {
            user: currentProfileUser.id
          },
          /*
            Limit,skip,sort,populate params
          */
          params: { limit: 20, sort: 'createdAt ASC' },
          /*
            Handle associations
          */
          addedto: {},
          removedfrom: {},
          /*
            Handle display validators
          */
          validators: {
            created: [
              function (data) {
                console.log(data)
                return true
              }
            ]
          },
          /*
            Render options
          */
          renderOpts: {
            //The max dom elements to have within the container
            maxDomElements: 20,
            //How children elements are remove
            childRemovalMethod: 'first',
            //How new elements are added to the container
            renderMethod: 'append',
            /*
              The template a container for this endpoint target.
            */
            template: '#notificationstemplate',
            container: '#notificationscontainer',
            /*
              Modify the data returned into view friendly dates.
            */
            beforeDataRendered: function (notification) {
              notification.date = moment(notification.createdAt).format('YYYY-MM-DD')
              notification.day = moment(notification.createdAt).format('DD')
              notification.month = moment(notification.createdAt).format('MM')
              notification.year = moment(notification.createdAt).format('YY')
              notification.hour = moment(notification.createdAt).format('HH')
              notification.minutes = moment(notification.createdAt).format('MM')
              notification.seconds = moment(notification.createdAt).format('SS')
              notification.AMPM = moment(notification.createdAt).format('A')
              console.log('Before data rendered:')
              console.log(notification)
              return notification
            }
          }
        },
        /*
          User profile comment reply target
        */
        {
            /*
              The event name for this target
            */
            eventName: 'userprofilecommentreply',    
            /*
               True if we should listen for socket events under this event name.
            */
            shouldListen: false,
            renderOpts: {
              /*
                Max number of user profile comments to be displayed before triggering a removal 
              */
              maxDomElements: 5,
              /*
                How child elements should be removed when new ones are added
              */
              childRemovalMethod: 'first',
              /*
                How children elements should be added
              */
              renderMethod: 'append',

              /*
                The template to use for displaying data.
              */
              template: '#userprofilecommentreplytemplate',
              /*
                Finds the container for this comment
              */
              container: function (data) {
                console.log(data)
                console.log('finding container')
                const parentCommentId = data.id
                const container = $('#userprofilecommentcontainer')
                  .find('li[data-attr-id="' + parentCommentId + '"] .userprofilecommentreplies')
                return container
              }
            }
          },
          {
            eventName: 'userprofilecomment',
            path: '/userprofilecomment',
            where: { userProfile: currentProfileUser.userProfile.id, isReply: false },
            params: { limit: 10, sort: 'createdAt ASC', populate:'user,userProfile,replies'},
            shouldListen: true,
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
            validators: {
              created: [
                /*
                  Validates that the correct information is within the data
                  before it gets rendered, and also ensures it is a top level comment.

                  Due to the nature of sails.js, the publishCreate event `create` will be triggered
                  for a comment whether or not it is a comment reply.
                */
                function validateTopLevelComment (data) {
                  if (data && !data.isReply && data.user) return true
                  else return false
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
              renderMethod: 'prepend',
              /*
                The way in which child elements will be removed from the DOM
                upon a new element being created and maxDomElements being exceeded.
              */
              childRemovalMethod: 'last',

              /*
                The types of effects to be applied to this DOM element 
              */
              removeEffect: ['fadeOut', 1000],
              updateEffect: [],
              createEffect: [],
              /*
                The template and container for this type of event.
              */
              template: '#userprofilecommenttemplate',
              container: '#userprofilecommentcontainer',
              /*
                Hooks the dynamically generated form before it is created 
                and applies ajaxForm to it, so that it will be posted via AJAX.
              */
              beforeCreate: function ($html) {
                $html.find('.replyForm').ajaxForm($.ajaxFormHandler({
                  errorMessage: 'Reply not recorded',
                  successMessage: 'Successfully replied to comment'
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
    }

    const addProfileLoadListener = function () {
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
    }

    const loadProfile = function () {
      $.seatfilla.userprofile.dataLoader.loadAndListen()
    }


    /*
       Load results asynchronously and wait until all have complete,
       then merge results and load users profile.
     */
    Promise.all([obtainCurrentProfileUser(), obtainCurrentUser()])
      .then(function (results) {
        if (!results || results.length != 2) {
          return Promise.reject('Wrong results len')
        } else {
          console.log('results')
          console.log(results)
          const currentProfileUser = results[0]
          const user = results[1]

          attachDomReactor(currentProfileUser, user)
          attachExternalFunctions(currentProfileUser, user)
          addProfileLoadListener()
          loadProfile()
        }
      }).catch(function (err) {
      // Handle error
      handleProfileError(err)
    })
  })(jQuery, io)
})
