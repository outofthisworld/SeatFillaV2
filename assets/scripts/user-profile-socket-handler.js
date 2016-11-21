$(window).ready(function () {
  $.DomSocketHandler = function (map) {
    if (!this instanceof $.DomSocketHandler) return new $.DomSocketHandler()
    this.validators = {}
    this.mapping = map
  }

  $.DomSocketHandler.prototype.checkRenderConditions = function (data, validators) {
    var _validData = true
    if (!validators) return _validData
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
  // Userprofilecomment addedTo replies
  // mapping[userprofilecomment][addedto][replies]
  $.DomSocketHandler.prototype.handleChangedAssociation = function (data, eventName, verb, attribute, action) {
    if (!eventName.attribute || !verb || !action || typeof action != 'function') {
      console.log('Invalid params passed to handleChangedAssociation')
      console.log(arguments)
    }

    if (!this.mapping) {
      console.log('Invalid state, missing mapping in handleChangedAssociation')
      return
    }

    if (!this.mapping[eventName]) {
      console.log('Mapping for ' + eventName + ' does not exist')
      return
    }

    var mapping = this.mapping[eventName]

    if (!verb in mapping) {
      console.log('verb ' + verb + ' does not exist in mapping ' + JSON.stringify(mapping))
      return
    }
    mapping = mapping[verb]

    if (!attribute in mapping) {
      console.log('attribute ' + attribute + ' does not exist in mapping ' + JSON.stringify(mapping))
      return
    }

    mapping = mapping[verb][attribute]

    if (!mapping.event) {
      console.log('Mapping.event did not exist in mapping ' + JSON.stringify(mapping))
      return
    }

    if (!this.mapping[mapping.event]) {
      console.log('mapping.event ' + mapping.event + ' does not exist')
      return
    }

    if (mapping[action]) {
      if (typeof mapping[action] == 'function') {
        mapping.action.call(this, data, eventName, mapping.event)
      } else if (this[mapping.action] && typeof this[mapping.action] == 'function') {
        this[mapping.action].call(this, data, mapping.event)
      } else {
        console.log('Invalid action for mapping ' + JSON.stringify(mapping))
      }
    } else {
      action.call(this, data, mapping.event)
    }
  }

  $.DomSocketHandler.prototype.addedto = function (data, eventName, verb, attribute) {
    this.handleChangedAssociation(data, eventName, verb, attribute, this.created)
  }

  $.DomSocketHandler.prototype.removedfrom = function (data, eventName, verb, attribute) {
    this.handleChangedAssociation(data, eventName, verb, attribute, this.destroyed)
  }

  $.DomSocketHandler.prototype.created = function (data, eventName) {
    if (!this.mapping || !eventName in this.mapping) {
      console.log('Invalid mapping for ' + eventName)
    }

    const mapping = this.mapping[eventName]
    const validators = mapping.validators && mapping.validators.created

    if (this.checkRenderConditions(data, validators)) {
      if (!mapping.renderOpts) {
        console.log('Invalid mapping for ' + eventName + 'no render opts specified')
      }

      const renderOpts = mapping.renderOpts
      var template = renderOpts.tempalate
      var container = renderOpts.container

      if (!template || !container) {
        console.log('Could not find template or container ')
        return
      }

      const $template = $.templates(template)
      const $container = $(container)

      if (!$container.length || !$template) {
        console.log('Container or template dom element does not exist')
        return
      }

      const html = $template.render(data)
      const $html = $(html)

      if (renderOpts.maxDomElements && $container.children().length > options.maxDomElements) {
        if (renderOpts.removeFromDom && typeof renderOpts.removeFromDom == 'function') {
          renderOpts.removeFromDom.call(null, data, $container)
        } else {
          $container.children().first().fadeOut(1000).remove()
        }
      }

      if (renderOpts.addToDom && typeof renderOpts.addToDom == 'function') {
        renderOpts.addToDom.call(null, data, $html, $container)
      } else {
        $html.hide().appendTo($container).fadeIn(1000)
      }
    } else {
      console.log('(Created event) :' + JSON.stringify(data) + ' was not validated')
    }
  }

  // Userprofilecomment
  $.DomSocketHandler.prototype.updated = function (data, eventName) {
    if (!this.mapping) {
      console.log('Invalid state in $.DomSocketHandler, mapping does not exist')
    }

    if (!eventName in this.mapping) {
      console.log(eventName + 'does not exist in mapping ' + this.mapping)
    }

    const mapping = this.mapping[eventName]
    const validators = mapping.validators

    if (this.checkRenderConditions(data, validators)) {
      var template = mapping.renderOpts.template
      var container = mapping.renderOpts.container

      if (!template || !container) {
        console.log('invlaid template or container for updated event')
        return
      }

      const $container = $(container)
      const template = $.templates(template)

      if (!$container.length || !$template) {
        console.log('Could not find dom element ')
        return
      }

      const $html = template.render(data)

      var findDomElement = mapping.renderOpts.findDomElement
      var updateInDom = mapping.renderOpts.updateInDom

      var $updatedDomElement = null
      if (findDomElement && typeof findDomElement == 'function') {
        $updatedDomElement = $(findDomElement.call(null, data, $container))
      } else {
        $updatedDomElement = $container.find('[data-attr-id=' + data.id + ']')
      }

      if (!($updatedDomElement.length)) {
        console.log('Unable to find update element in dom for data ' + JSON.stringify(data))
        return
      }

      if (updateInDom) {
        updateInDom.call(null, data, $html, $container)
      } else {
        $updatedDomElement.fadeOut(1000, function () {
          $html.hide()
          $updatedDomElement.replaceWith($html.fadeIn(1000))
        })
      }
    } else {
      console.log('(Updated event) :' + JSON.stringify(data) + ' was not validated')
    }
  }

  $.DomSocketHandler.prototype.destroyed = function (data, eventName) {
    if (!this.mapping) {
      console.log('Invalid state of $.DomSocketHandler in destroyed')
    }

    if (!eventName in this.mapping) {
      console.log(eventName + ' does not exist in mapping ' + this.mapping)
      return
    }

    const mapping = this.mapping[eventName]
    const validators = mapping.validators

    if (this.checkRenderConditions(data, validators)) {
      var container = mapping.renderOpts.container
      var findInDom = mapping.renderOpts.findInDom
      var destroyInDom = mapping.renderOpts.destroyInDom

      if (!container) {
        console.log('Invalid container for remove')
        return
      }

      const $container = $(container)

      if (!$container.length) {
        console.log('could not find container in remove')
        return
      }

      $domEle = findInDom && $(findInDom.call(null, data, $container)) || $(container).find('[data-attr-id=' + data.id + ']')

      if ($domEle && $domEle.length) {
        if (destroyInDom) {
          destroyInDom.call(null, data, $container)
        } else {
          $domEle.fadeOut(1000).remove()
        }
      } else {
        console.log('Could not find dom element to remove')
      }
    }
  }

  $.DomSocketHandler.prototype.loadedFromSocket = function (data, eventName) {
    if (this.checkRenderConditions(data, this.validators.loadedFromSocket)) {
      this.created(data, eventName)
    } else {
      console.log('(Loaded event) :' + JSON.stringify(data) + ' was not validated')
    }
  }

  const DataLoaderProto = {
    on: function (attr, func) {
      if (!attr) return false

      this.events[attr] = this.events[attr] || []
      if (Array.isArray(attr)) {
        attr.forEach(function (a) {
          this.events[a].push(func)
        })
      } else {
        this.events[attr].push(func)
      }
      console.log(this.events)
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
        var _this = thisArg || obj
        for (var i = 1; i < attr.length; i++) {
          if (!obj) return
          obj = obj[attr[i]]
        }
        if (typeof obj == 'function') obj.apply(_this, paramArgs)
        if (Array.isArray(obj)) {
          obj.forEach(function (c) {
            if (typeof c == 'function') c.apply(_this, paramArgs)
          })
        }
        return
      }
      if (this.events[attr]) {
        console.log(this.events[attr])
        this.events[attr].forEach(function (f) {
          if (typeof f === 'function')
            f.apply(thisArg, paramArgs)
        })
      }
    },
    addTarget: function (options) {
      const _dataHandler = this
      var eventName = options.eventName,
        path = options.path,
        query = options.query

      var qString = '?'
      for (var key in query) {
        qString.concat('&' + key + '=' + query[key])
      }

      const fpath = path.concat(qString)
      this.endPointTargets.push({
        eventName,
        fpath,
        handlerFn: function (data, jwRes) {
          function handleSocketEvent (eventName, verb, attribute, data) {
            if (!eventName || !verb || !data) {
              console.log('Invalid params passed to trigger')
              return
            }
            if (attribute) {
              _dataHandler.trigger([eventName, verb], null, [data, eventName, verb, attribute || null])
            } else {
              _dataHandler.trigger([eventName, verb], null, [data, eventName])
            }
          }

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
        },
        target: function () {
          const _endPointTarget = this
          return new Promise(function (resolve, reject) {
            io.socket.get(fpath, function (data, jwRes) {
              const resolve = this.resolve
              const reject = this.reject

              console.log('Receieved data from path ' + this.path)
              console.log(data)
              console.log('Response was:' + jwRes.statusCode)
              if (jwRes.statusCode != 200)
                return reject(new Error('Invalid response code in repsonse handler'))

              // Set the socket listener
              io.socket.on(eventName, _endPointTarget.handlerFn)

              return resolve(data)
            })
          })
        }
      })
    },
    loadAndListen: function () {
      const _this = this

      if (this.isLoaded) {
        this.endPointTargets.forEach(function (t) {
          io.socket.off(t.eventName, t.handlerFn)
        })
        this.trigger('reload')
        this.isLoaded = false
      }

      return Promise.all(this.endPointTargets.map(function (t) {
        return t.target()
      }))
        .then(function (results) {
          const fResult = Object.assign.apply(null, [{}].concat(this.endPointTargets.map(function (x, indx) {
            const obj = []
            obj[x.eventName] = results[indx]
            return obj
          })))

          _this.isLoaded = true
          _this.trigger('load', fResult)

          for (key in fResult) {
            if (Array.isArray(fResult[key])) {
              fResult[key].forEach(function (dataObj) {
                _this.trigger([key, 'loadedFromSocket'], null, [dataObj])
              })
            } else {
              _this.trigger([key, 'loadedFromSocket'], null, [fResult[key]])
            }
          }
          return resolve(fResult)
        }).catch(function (err) {
        console.log(err)
        Promise.reject(err)
        if (options.onError && typeof options.onError == 'function')
          options.onError.call(null, err)
      })
    }
  }

  $.domReactor = function (map) {
    return new $.DomSocketHandler(map)
  }

  $.SocketDataLoader = function (options) {
    const socketDataLoader = Object.create(DataLoaderProto, {
      events: {},
      endpointTargets: [],
      isLoaded: false
    })

    if (!options) return socketDataLoader

    if (options.targets && Array.isArray(options.targets)) {
      options.targets.forEach(function (t) {
        if (t.eventName && t.path && t.query) {
          socketDataLoader.addTarget({
            eventName: t.eventName,
            path: t.path,
            query: t.query
          })
        } else {
          throw new Error('Invalid params to $.SocketDataLoader')
        }

        if (options.domReactor && !t.renderOpts || !t.renderOpts.template || !t.renderOpts.container) {
          throw new Error('Invalid params to $.SocketDataLoader')
        }
      })
    }

    if (options.domReactor) {
      socketDataLoader.on(this.eventName,
        Object.assign($.domReactor(
          this.targets.map(function (x) {
            const obj = {}
            obj[x.eventName] = x
            return obj
          }))))
    }

    if (options.autoLoad) {
      socketDataLoader.loadAndListen()
    }

    return socketDataLoader
  }
})

$(window).ready(function () {
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

    /*

         new Promise(function(resolve, reject) {
                    io.socket.get('/userprofile/' + user.username, responseHandler.bind({
                        path: '/userprofile/' + user.username,
                        resolve,
                        reject
                    }))
                }),
                new Promise(function(resolve, reject) {
                    io.socket.get('/userprofilecomment?user=' + user.id, responseHandler.bind({
                        path: '/userprofilecomment?user=' + user.id,
                        resolve,
                        reject
                    }))
                }),
                new Promise(function(resolve, reject) {
                    io.socket.get('/userprofileimage?user=' + user.id, responseHandler.bind({
                        path: '/userprofileimage?user=' + user.id,
                        resolve,
                        reject
                    }))
                }),
                new Promise(function(resolve, reject) {
                    io.socket.get('/userprofilelink?user=' + user.id, responseHandler.bind({
                        path: '/userprofilelink?user=' + user.id,
                        resolve,
                        reject
                    }))
                }),
                new Promise(function(resolve, reject) {
                    io.socket.get('/bid?user=' + user.id, responseHandler.bind({
                        path: '/bids?user=' + user.id,
                        resolve,
                        reject
                    }))
                }),
                new Promise(function(resolve, reject) {
                    io.socket.get('/flightRequest?user=' + user.id, responseHandler.bind({
                        path: '/flightRequest?user=' + user.id,
                        resolve,
                        reject
                    }))
                }),
                new Promise(function(resolve, reject) {
                    io.socket.get('/flightGroup?user=' + user.id, responseHandler.bind({
                        path: '/flightGroup?user=' + user.id,
                        resolve,
                        reject
                    }))
                }),
                new Promise(function(resolve, reject) {
                    io.socket.get('/hotel?user=' + user.id, responseHandler.bind({
                        path: '/hotel?user=' + user.id,
                        resolve,
                        reject
                    }))
                }),
                new Promise(function(resolve, reject) {
                    io.socket.get('/notifications?user=' + user.id, responseHandler.bind({
                        path: '/hotel?user=' + user.id,
                        resolve,
                        reject
                    }))
                })

    */
    const notificationTarget = {
      eventName: 'notifications',
      path: '/notifications',
      query: {
        user: 1
      },
      addedto: {},
      removedfrom: {},
      renderOpts: {
        maxDomElements: 5,
        template: '#notificationstemplate',
        container: '#notificationscontainer'
      }
    }

    const userProfileLinkTarget = {
      eventName: 'userprofilelink',
      path: '/notifications',
      query: {
        user: 1
      },
      renderOpts: {
        maxDomElements: 5,
        template: '#userprofilelinktemplate',
        container: '#userprofilelinkcontainer'
      }
    }

    const userProfileCommentReplyTarget = {
      eventName: 'userprofilecommentreply',
      renderOpts: {
        maxDomElements: 5,
        template: '#userprofilecommentreplytemplate',
        container: '.userprofilecommentreplies',
        addToDom: function (data, $html, $container) {
          $container.find()
        },
        destroyInDom: function (data, $container) {},
        updateInDom: function (data, $html, $container) {}
      }
    }

    const userProfileCommentTarget = {
      eventName: 'userprofilelink',
      path: '/notifications',
      query: {
        user: 1
      },
      addedTo: {
        replies: {
          event: 'userprofilecommentreply'
        }
      },
      removedFrom: {
        replies: {
          event: 'userprofilecommentreply'
        }
      },
      renderOpts: {
        maxDomElements: 5,
        template: options.userprofileimage.template,
        container: options.userprofileimage.container
      }
    }

    const userProfileImageTarget = {
      eventName: 'userprofileimage',
      path: '/userprofileimage',
      query: {
        user: 1
      },
      renderOpts: {
        maxDomElements: 5,
        template: '#userprofileimagetemplate',
        container: '#userprofileimagecontainer'
      }
    }

    const userProfileTarget = {
      eventName: 'userprofilelink',
      path: '/userprofile',
      query: {
        username: ''
      },
      addedTo: {
        images: {
          renderOpts: userprofileimage.renderOpts
        },
        comments: {
          renderOpts: userprofilecomment.renderOpts
        },
        userLinks: {
          renderOpts: userprofilelink.renderOpts
        }
      },
      removedFrom: {
        images: {
          renderOpts: userprofileimage.renderOpts
        },
        comments: {
          renderOpts: userprofilecomment.renderOpts
        },
        userLinks: {
          renderOpts: userprofilelink.renderOpts
        }
      },
      renderOpts: {
        maxDomElements: 5,
        template: options.userprofiletemplate,
        container: options.userprofile.container
      }
    }

    const flightRequestTarget = {
      eventName: 'userprofilelink',
      path: '/notifications',
      query: {
        user: 1
      },
      renderOpts: {
        maxDomElements: 5,
        template: options.userprofileimage.template,
        container: options.userprofileimage.container
      }
    }

    const flightGroupTarget = {
      eventName: 'userprofilelink',
      path: '/notifications',
      query: {
        user: 1
      },
      renderOpts: {
        maxDomElements: 5,
        template: options.userprofileimage.template,
        container: options.userprofileimage.container
      }
    }

    const hotelTarget = {
      eventName: 'userprofilelink',
      path: '/notifications',
      query: {
        user: 1
      },
      renderOpts: {
        maxDomElements: 5,
        template: options.userprofileimage.template,
        container: options.userprofileimage.container
      }
    }
    const userTarget = {
      eventName: 'userprofilelink',
      path: '/notifications',
      query: {
        user: 1
      },
      renderOpts: {
        maxDomElements: 5,
        template: options.userprofileimage.template,
        container: options.userprofileimage.container
      }
    }
    const bidTarget = {
      eventName: 'userprofilelink',
      path: '/notifications',
      query: {
        user: 1
      },
      renderOpts: {
        maxDomElements: 5,
        template: options.userprofileimage.template,
        container: options.userprofileimage.container
      }

    }

    $.seatfilla = $.seatfilla || {}
    $.seatfilla.userprofile = $.seatfilla.userprofile || {}
    $.seatfilla.userprofile.dataLoader = $.SocketDataLoader({
      targets: [
        notificationTarget,
        userProfileLinkTarget,
        userProfileCommentReplyTarget,
        userProfileImageTarget,
        userProfileTarget,
        flightRequestTarget,
        flightGroupTarget,
        hotelTarget,
        userTarget,
        bidTarget
      ],
      onError: function (err) {
        console.log(err)
      }
    })

    $.seatfilla.userprofile.dataLoader.on('load', function () {
      const reponseData = this
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
    })

    $.seatfilla.userprofile.dataLoader.loadAndListen()
  })
})
