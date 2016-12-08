$(window).ready(function () {
  (function ($, io) {
    const currentUserProfileUser = window.seatfilla.globals.userprofile.getCurrentUserProfileUser(window.location.pathname)

    /**
     *  Handles an error that occurs during this scripts duration.
     *
     * @param {any} err
     */
    const handleProfileError = function (err) {
      console.log(err)
    }

    /*
      Early return if we cannot find the user this profile belongs to.
    */
    if (!currentUserProfileUser) return handleProfileError(new Error('Could not find profile user'))

    /**
     *
     *
     * @returns
     */
    const obtainCurrentProfileUser = function () {
      return new Promise(function (resolve, reject) {
        io.socket.get('/user?username=' + currentUserProfileUser + '&populate=userProfile', function (user, jwRes) {
          if (jwRes.statusCode == 200 && user) {
            if (Array.isArray(user)) {
              if (!(user.length)) return reject(new Error('Could not find current profile user'))

              user = user[0]

              // Make sure that the first element wasn't null
              if (!user) return reject('Profile user was null')
            }
            if (!user.userProfile || (Array.isArray(user.userProfile) && !user.userProfile.length)) {
              return reject(new Error('Database error'))
            }
            user.userProfile = user.userProfile[0]
            return resolve(user)
          } else {
            return reject(new Error('Current profile user not found'))
          }
        })
      })
    }

    /**
     *
     *
     * @returns
     */
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

    /**
     *
     *
     * @param {any} currentProfileUser
     * @param {any} user
     */
    /**
     *
     *
     * @param {any} link
     */
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
          /**
           *
           *
           * @param {any} data
           * @param {any} ts
           * @param {any} xhr
           */
          success: function (data, ts, xhr) {},
          /**
           *
           */
          error: function () {}
        })
      }

      // Complete this when know what data is being sent from the server
      /**
       *
       *
       * @returns
       */
      $.seatfilla.userprofile.currentUserIsLink = function () {
        if (!user || !user.userProfile.userLinks.find(function (link) {
            link.user == currentProfileUser.id
          })) return false
        return true
      }

      /*
        Returns true via a CB if this is the users own profile.
        callback is required due the getUser being asnychronous.
      */
      /**
       *
       *
       * @param {any} cb
       * @returns
       */
      $.seatfilla.userprofile.isOwnProfile = function (cb) {
        if (!user || currentProfileUser.id != user.id) return false
        return true
      }
    }

    /**
     * Creates and attaches the dom reactor to this page.
     *
     * @param {Object} currentProfileUser
     * @param {Object} user
     */
    const attachDomReactor = function (currentProfileUser, user) {
      if (!currentProfileUser) throw new Error('Invalid params')

      console.log(currentProfileUser)
      /*
        Extend jQuery and add own namespace.
      */
      $.seatfilla = $.seatfilla || {}
      $.seatfilla.userprofile = $.seatfilla.userprofile || {}

      const globalViewExtensions ={
          getCurrentProfileUser() {
            return currentProfileUser;
          },
          getCurrentUser() {
            return user || null;
          }
      }
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
            params: {
              limit: 20,
              sort: 'createdAt ASC'
            },
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
              // The max dom elements to have within the container
              maxDomElements: 20,
              // How children elements are remove
              childRemovalMethod: 'first',
              // How new elements are added to the container
              renderMethod: 'append',
              viewExtensions:globalViewExtensions,
              /*
                The template a container for this endpoint target.
              */
              template: '#notificationstemplate',
              container: '#notificationscontainer',
              /*
                Modify the data returned into view friendly dates.
              */
              /**
               *
               *
               * @param {Object} notification
               * @returns
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
          {
            /*
              The event name for this target
            */
            eventName: 'hotelbid',
            path: '/HotelBid',
            where: {
              user: currentProfileUser.id
            },
            params: {
              sort: 'createdAt DESC',
              limit: '10',
              populate: JSON.stringify({hotelSale: {}})
            },
            validators: {
              created: function (data) {
                if (!data.user || (data.user != currentProfileUser.id && data.user.id != currentProfileUser.id))
                  return false
              }
            },
            /*
               True if we should listen for socket events under this event name.
            */
            shouldListen: true,
            renderOpts: {
              /*
                Max number of user profile comments to be displayed before triggering a removal
              */
              maxDomElements: 10,
              /*
                How child elements should be removed when new ones are added
              */
              childRemovalMethod: 'last',
              /*
                How children elements should be added
              */
              renderMethod: 'append',
              
              viewExtensions:globalViewExtensions,

              /*
                The template to use for displaying data.
              */
              template: '#hotelbidtemplate',
              container: '#hotelbidcontainer',

              /**
               * Finds the container for this comment
               *
               * @param {Object} data, the data to be added to this container
               * @returns
               */
              afterCreate: function (data) {
                console.log('after create')
                $('#seatfilla_currencies').trigger('change')
              }
            }
          },
          {
            /*
              The event name for this target
            */
            eventName: 'user',
            /*
               True if we should listen for socket events under this event name.
            */
            addedto: {
              hotelBids: {
                event: 'hotelbid'
              }
            },
            removedfrom: {
              hotelBids: {
                event: 'hotelbid'
              }
            },
            shouldListen: true,
            renderOpts: {
              template: '#ph',
              container: '#ph',
              viewExtensions:globalViewExtensions,
            }
          },
          {
            /*
              The event name for this target
            */
            eventName: 'hotelsale',
            path: '/hotelsale',
            where: {
              currentWinner: currentProfileUser.id
            },
            params: {
              sort: 'createdAt DESC',
              populate: JSON.stringify({hotel: {},bids: {}})
            },
            /*
               True if we should listen for socket events under this event name.
            */
            shouldListen: true,
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

              viewExtensions:globalViewExtensions,

              /*
                The template to use for displaying data.
              */
              template: '#winninghotelsalestemplate',
              container: '#winninghotelsalescontainer',
              updateInDom(data, $html, $container) {
                console.log(data)
                if (data.currentWinner != currentProfileUser.id) {
                  $.toaster({message: 'This user has just lost his bid placement in auction ' + data.hotel, priority: 'info'})
                  $('#winninghotelsalescontainer').find('tr[data-attr-id="' + data.id + '"]').fadeOut(1000)
                }else {
                  $.toaster({message: 'This user has just lost his just secured his placement on auction ' + data.hotel, priority: 'info'})
                  $('#winninghotelsalescontainer').find('tr[data-attr-id="' + data.id + '"]').css('background-color', 'green')
                }
              }
            }
          },
          {
            /*
              The event name for this target
            */
            eventName: 'userprofile',
            path: '/userprofile/' + currentProfileUser.username + '/findOne',
            params: {
              id: currentProfileUser.userProfile.id,
              populate: 'user,images'
            },
            addedto: {
              bids: {
                event: 'hotelbid'
              }
            },
            removedfrom: {
              bids: {
                event: 'hotelbid'
              }
            },
            /*
               True if we should listen for socket events under this event name.
            */
            shouldListen: true,
            renderOpts: [{
              /*
                Max number of user profile comments to be displayed before triggering a removal
              */
              maxDomElements: 1,
              /*
                How child elements should be removed when new ones are added
              */
              childRemovalMethod: 'first',
              /*
                How children elements should be added
              */
              renderMethod: 'append',
              
              viewExtensions:globalViewExtensions,

              /*
                The template to use for displaying data.
              */
              template: '#userprofileinfotemplate',

              /**
               * Finds the container for this comment
               *
               * @param {Object} data, the data to be added to this container
               * @returns
               */
              container: '#userprofileinfocontainer'
              
            },{
              /*
                Max number of user profile comments to be displayed before triggering a removal
              */
              maxDomElements: 1,
              /*
                How child elements should be removed when new ones are added
              */
              childRemovalMethod: 'first',
              /*
                How children elements should be added
              */
              renderMethod: 'append',
              viewExtensions:globalViewExtensions,

              /*
                The template to use for displaying data.
              */
              template: '#userProfileNavTabsTemplate',
              

              /**
               * Finds the container for this comment
               *
               * @param {Object} data, the data to be added to this container
               * @returns
               */
              container: '#userProfileNavTabsContainer',
              afterCreate:function(){
                $('.nav-tabs a[data-page]').on('click',function(){
                  const target = $(this).attr('data-page')
                  if(!target) return;
                  if($(this).attr('href')){
                      console.log($(this).attr('href'))
                  }
                  $('.nav-tabs li').removeClass('active')
                  $(this).parent().addClass('active')
                  const container = $(this).parent().parent().attr('data-container')
                  if(container){
                    $(container).html("")
                    console.log('loading: ' + target)
                    $(container).load(target,function(res,ts,xhr){

                        if(xhr.status != 200){
                            console.log('not 200')
                            return;
                        };
                        $.lazyLoadScripts({},function(err){
                            if(err) alert('Error loading scripts')
                        })
                    });
                  }
              })
              
                function navigate(){
                  const hashParts = window.location.hash.split('/');
                    if(hashParts && hashParts.length){
                        $('#userProfileNavTabsContainer').find('li[data-hash="'+hashParts[0]+'"]').find('a[data-page]').trigger('click')
                    }
                }navigate();
                $('#userNavMenu').on('click',navigate);
              }
            }]
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
              viewExtensions:globalViewExtensions,

              /**
               * Finds the container for this comment
               *
               * @param {Object} data, the data to be added to this container
               * @returns
               */
              container: function (data) {
                console.log(data)
                console.log('finding container for user profile comment')
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
            where: {
              userProfile: currentProfileUser.userProfile.id,
              isReply: false
            },
            params: {
              limit: 10,
              sort: 'createdAt ASC',
              populate: 'user,userProfile,replies'
            },
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
              viewExtensions:globalViewExtensions,
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

              /**
               * Hooks the dynamically generated form before it is created
               * and applies ajaxForm to it, so that it will be posted via AJAX and
               * automatically validated via attributes set on the form.
               *
               * Unfortunetely, this has to be done because jQuery does not pick up on
               * dynamically generated DOM elements but rather only elements which
               * are only visible on the page.
               *
               * Without listening to elements added to the DOM, this is the best way
               * to attach to the dynamically generated form.
               * @param {any} $html
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

        /**
         * A callback function for if an error occurs whilst creating the loader
         * or loading data from the socket, currently this is set to just
         * redirect the user to the homepage.
         *
         * @param {any} err
         */
        onError: handleProfileError
      })
    }

    /**
     *  On `load` event for when the data is first loaded by the SocketDataLoader.
     *  The event is triggered and `this` refers to the data that has been loaded from
     *  the socket.
     *
     *  Because we have full access to data returned from the SocketDataLoader within this event,
     *  it is a useful place to add extensions which can be used to operate on the returned data.
     */
    const addProfileLoadListener = function () {
      /*
        On `load` listener for created data loader.
      */
      $.seatfilla.userprofile.dataLoader.on('load', function () {
        const responseData = this

        /**
         *
         *
         * @returns all data about a users profile
         */
        $.seatfilla.userprofile.getProfileInfo = function () {
          return responseData
        }

        /**
         * Calls back the specified callback in order to extend $.seatfilla.userprofile.
         *
         * @param {any} callback a callback function which takes in the userprofile namespace.
         */
        $.seatfilla.userprofile.configure = function (callback) {
          if (callback && typeof callback == 'function') callback.call($.seatfilla.userprofile)
        }
      })
    }

    /**
     *  Loads and listens for data incoming via a socket.
     */
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
