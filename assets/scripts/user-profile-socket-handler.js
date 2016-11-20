$(window).ready(function () {
  $.SocketDataLoader = function (options) {
    const DataLoader = function () {
      this.events = {}
      this.endpointTargets = []
      this.isLoaded = false
    }

    DataLoader.prototype = {
      on: function (attr, func) {
        if (!attr) return false
        this.events[attr] = this.events[attr] || []
        this.events[attr].push(func)
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
              _dataHandler.trigger([eventName, verb], null, [data, eventName, verb, attribute || null])
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

    const socketDataLoader = new $.SocketDataLoader
    if (options) {
      if (options.targets && Array.isArray(options.targets)) {
        options.targets.forEach(function (t) {
          socketDataLoader.addTarget(t)
        })
      }
      if (options.autoLoad) {
        socketDataLoader.loadAndListen()
      }
    }
    return socketDataLoader
  }

  $.createDomSocketHandler = function (options) {
    $.DomSocketHandler = function () {
      if (!this instanceof $.DomSocketHandler) return new $.DomSocketHandler()
      this.validators = {}
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

    $.DomSocketHandler.prototype.addedto = function (data, eventName, verb, attribute) {
      if (!attribute) return
      const mapping = options[eventName]
      if (eventName in mapping && verb in mapping[eventName] && attribute in mapping[eventName][verb]) {
        const mapping = mapping[eventName][verb][attribute]
        if (this[mapping.action])
          this[mapping.action].call(this, data, mapping.renderOpts)
        else
          this.created(data, mapping.renderOpts)
      }
    }

    $.DomSocketHandler.prototype.removedfrom = function (data, eventName, verb, attribute) {
      if (!attribute) return
      const mapping = options[eventName]
      if (eventName in mapping && verb in mapping[eventName] && attribute in mapping[eventName][verb]) {
        const mapping = mapping[eventName][verb][attribute]
        if (this[mapping.action])
          this[mapping.action].call(this, data, mapping.renderOpts)
        else
          this.destroyed(data, mapping.renderOpts)
      }
    }

    $.DomSocketHandler.prototype.created = function (data, options) {
      var validators

      if (options) {
        validators = options.validators.created
      } else {
        validators = this.validators.created
      }

      if (this.checkRenderConditions(data, validators)) {
        var template
        var container

        if (options) {
          template = options.template
          container = options.container
        } else {
          template = this.template
          container = this.container
        }

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

        if (options.maxDomElements && $container.children().length > options.maxDomElements) {
          if (options.removeFromDom && typeof options.removeFromDom == 'function') {
            options.removeFromDom.call(null, data, $container)
          } else {
            $container.children().first().fadeOut(1000).remove()
          }
        }

        if (options.addToDom && typeof options.addToDom == 'function') {
          options.addToDom.call(null, data, $html, $container)
        } else {
          $html.hide().appendTo($container).fadeIn(1000)
        }
      } else {
        console.log('(Created event) :' + JSON.stringify(data) + ' was not validated')
      }
    }

    // Userprofilecomment
    $.DomSocketHandler.prototype.updated = function (data, options) {
      var validators

      if (options) {
        validators = options.validators.updated
      } else {
        validators = this.validators.updated
      }

      if (this.checkRenderConditions(data, validators)) {
        var template
        var container

        if (options) {
          template = options.template
          container = options.container
        } else {
          template = this.template
          container = this.container
        }

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

        var findDomElement = null
        var updateInDom = null
        if (options) {
          findDomElement = (options && options.findDomElement) || null
          updateInDom = (options && options.updateInDom) || null
        } else {
          findDomElement = this.findDomElement || null
          updateInDom = this.updateInDom || null
        }

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

    $.DomSocketHandler.prototype.destroyed = function (data, options) {
      var validators

      if (options) {
        validators = options.validators.destroyed
      } else {
        validators = this.validators.destroyed
      }

      if (this.checkRenderConditions(data, validators)) {
        var container
        var findInDom
        var destroyInDom
        if (options) {
          container = options.container
          findInDom = options.findDomElement
          destroyInDom = options.destroyInDom
        } else {
          container = this.contianer
          findInDom = this.findDomElement
          destroyInDom = options.destroyInDom
        }

        if (!container) {
          console.log('Invalid container for remove')
          return
        }

        const $container = $(container)

        if (!$container.length) {
          console.log('could not find container in remove')
          return
        }

        $domEle
        if (findInDom) {
          $domEle = $(findInDom.call(null, data, $container))
        } else {
          $domEle = $(container).find('[data-attr-id=' + data.id + ']')
        }

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

    $.DomSocketHandler.prototype.loadedFromSocket = function (data) {
      if (this.checkRenderConditions(data, this.validators.loadedFromSocket)) {
        this.created(data)
      } else {
        console.log('(Loaded event) :' + JSON.stringify(data) + ' was not validated')
      }
    }
  }
})

/*$(window).ready(function() {

            /*
        const socketDataLoaderOptions = {
            autoLoad:true,
            targets:[
                {
                    eventName:'notifications',
                    path:''
                    query:''
                }
            ],
            onError:function(err){
                console.log(err)
            }
        }
        const currentUserProfileUser = window.seatfilla.globals.userprofile.getCurrentUserProfileUser(window.location.pathname)

        if (!currentUserProfileUser) return

        io.socket.get('/user?username=' + currentUserProfileUser, function(user, jwRes) {
            if (!user) return
            if (Array.isArray(user) && !user.length) return
            if (Array.isArray(user)) user = user[0]

            if (jwRes.statusCode != 200) {
                alert('Invalid response from server')
                window.location.href = '/'
            }

            Promise.all([
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
            ]).then(function(results) {
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
                    user
                }

                this.trigger('load', responseData)

 

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
                ].forEach(function(eType) {

                })

                for (var key in responseData) {
  
                }
            }).catch(function(err) {
                console.log(err)
            })

    const userprofilelink = {
        renderOpts: {
            maxDomElements: 5,
            template: options.userprofileimage.template,
            container: options.userprofileimage.container
        }
    }

    const userprofilecommentreply = {
        renderOpts: {
            maxDomElements: 5,
            template: '#userprofilecommentreplytemplate',
            container: '.userprofilecommentreplies',
            addToDom: function(data, $html, $container) {
                $container.find()
            },
            destroyInDom: function(data, $container) {

            },
            updateInDom: function(data, $html, $container) {

            }
        }
    }

    const userprofilecomment = {
        addedTo: {
            replies: {
                renderOpts: userprofilecommentreply.renderOpts
            }
        },
        removedFrom: {
            replies: {
                template: userprofilecommentreply.renderOpts
            }
        },
        renderOpts: {
            maxDomElements: 5,
            template: options.userprofileimage.template,
            container: options.userprofileimage.container
        }
    }

    const userprofileimage = {
        renderOpts: {
            maxDomElements: 5,
            template: '#userprofileimagetemplate',
            container: '#userprofileimagecontainer'
        }
    }

    const userprofile = {
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
    const flightrequest = {
        maxDomElements: 5,
        template: options.userprofileimage.template,
        container: options.userprofileimage.container
    }

    const flightgroup = {
        maxDomElements: 5,
        template: options.userprofileimage.template,
        container: options.userprofileimage.container
    }

    const hotel = {
            maxDomElements: 5,
            template: options.userprofileimage.template,
            container: options.userprofileimage.container
        },
        const user = {
                maxDomElements: 5,
                template: options.userprofileimage.template,
                container: options.userprofileimage.container
            },
            const bids = {
                    maxDomElements: 5,
                    template: options.userprofileimage.template,
                    container: options.userprofileimage.container

                },
                const notifications = {
                    maxDomElements: 5,
                    template: options.userprofileimage.template,
                    container: options.userprofileimage.container
                }

    $.seatfilla.userprofile.on('load', function() {

        const reponseData = this

        $.seatfilla.userprofile.sendUserProfileCommentToServer = function(parentId, message, callback) {
            if (parentId) {
                $.ajax({
                    data: {
                        message,
                        isReply: false,
                        user: 'loggedinuser'
                    },
                    url: '/userprofile/' + responseData.userprofile.id + '/comments',
                    success: function(data, ts, xhr) {},
                    error: function() {}
                })
            } else {
                $.ajax({
                    data: {
                        message: message,
                        isReply: true,
                        user: 'loggedinuser',
                        userProfile
                    },
                    url: '/userprofilecomment/' + parentId + '/replies',
                    success: function(response, ts, xhr) {
                        if (xhr.status == 200 && response && response.status == 200) {
                            console.log('Response adding comment ' + JSON.stringify(response))
                        } else {
                            console.log('Error adding comment')
                        }
                    },
                    error: function() {}
                })
            }
        }
        $.seatfilla.userprofile.sendUserProfileLinkRequestToServer = function() {
            $.ajax({
                url: '/userprofile/' + responseData.userprofile.id + '/userLinks',
                data: {
                    user: 'loggedinuser',
                    userprofile: responseData.userprofile.id
                },
                success: function(data, ts, xhr) {},
                error: function() {}
            })
        }
        $.seatfilla.userprofile.getCurrentProfileUser = function() {
                return currentUserProfileUser
            }
            // Complete this when know what data is being sent from the server
        $.seatfilla.userprofile.currentUserIsLink = function(cb) {
            window.seatfilla.globals.getUser(function(status, result) {
                if (status == 200 && result && result.username) {
                    return cb(true)
                } else {
                    return cb(false)
                }
            })
        }
        $.seatfilla.userprofile.isOwnProfile = function(cb) {
            window.seatfilla.globals.getUser(function(status, result) {
                if (status == 200 && result && result.username && result.username == currentUserProfileUser) {
                    return cb(true)
                } else {
                    return cb(false)
                }
            })
        }
        $.seatfilla.userprofile.getProfileInfo = function() {
            return responseData
        }
        $.seatfilla.userprofile.configure = function(callback) {
            if (callback && typeof callback == 'function') callback.call($.seatfilla.userprofile)
        }

        for (var key in options) {
            $.seatfilla.userprofile.socket.on(key, Object.assign(new $.createDomSocketHandler({
                userprofile,
                userprofileimage,
                userprofilelink,
                userprofilecomment,
                flightrequest,
                flightgroup,
                hotel,
                user,
                bid,
                notifications
            }), options[key]))
        }
    })

    $.seatfilla.userprofile.loadprofile()
})*/
