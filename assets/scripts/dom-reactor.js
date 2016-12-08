/*
    Script to handle real time.

    Created by Dale.

    Includes proxy created by google
    for intecepting access to object properties in which java
    does not have native support for.
*/
$(window).ready(function () {
  (function ($, io) {
    console.log('WIndow .ready, setting $.SocketHandler')
    ;(function (scope) {
      if (scope['Proxy']) {
        return
      }
      let lastRevokeFn = null

      /**
       * @param {*} o
       * @return {boolean} whether this is probably a (non-null) Object
       */
      function isObject (o) {
        return o ? (typeof o == 'object' || typeof o == 'function') : false
      }

      scope.Proxy = function (target, handler) {
        if (!isObject(target) || !isObject(handler)) {
          throw new TypeError('Cannot create proxy with a non-object as target or handler')
        }

        let throwRevoked = function () {}
        lastRevokeFn = function () {
          throwRevoked = function (trap) {
            throw new TypeError(`Cannot perform '${trap}' on a proxy that has been revoked`)
          }
        }
        let unsafeHandler = handler
        handler = {
          'get': null,
          'set': null,
          'apply': null,
          'construct': null
        }
        for (let k in unsafeHandler) {
          if (!(k in handler)) {
            throw new TypeError(`Proxy polyfill does not support trap '${k}'`)
          }
          handler[k] = unsafeHandler[k]
        }
        if (typeof unsafeHandler == 'function') {
          handler.apply = unsafeHandler.apply.bind(unsafeHandler)
        }

        let proxy = this
        let isMethod = false
        let targetIsFunction = typeof target == 'function'
        if (handler.apply || handler['construct'] || targetIsFunction) {
          proxy = function Proxy () {
            let usingNew = (this && this.constructor === proxy)
            throwRevoked(usingNew ? 'construct' : 'apply')

            if (usingNew && handler['construct']) {
              return handler['construct'].call(this, target, arguments)
            } else if (!usingNew && handler.apply) {
              return handler.apply(target, this, arguments)
            } else if (targetIsFunction) {
              if (usingNew) {
                let all = Array.prototype.slice.call(arguments)
                all.unshift(target)
                let f = /** @type {!Function} */ (target.bind.apply(target, all))
                return new f()
              }
              return target.apply(this, arguments)
            }
            throw new TypeError(usingNew ? 'not a constructor' : 'not a function')
          }
          isMethod = true
        }

        let getter = handler.get ? function (prop) {
          throwRevoked('get')
          return handler.get(this, prop, proxy)
        } : function (prop) {
          throwRevoked('get')
          return this[prop]
        }
        let setter = handler.set ? function (prop, value) {
          throwRevoked('set')
          let status = handler.set(this, prop, value, proxy)
          if (!status) {}
        } : function (prop, value) {
          throwRevoked('set')
          this[prop] = value
        }

        // Clone direct properties (i.e., not part of a prototype).
        let propertyNames = Object.getOwnPropertyNames(target)
        let propertyMap = {}
        propertyNames.forEach(function (prop) {
          if (isMethod && prop in proxy) {
            return; // ignore properties already here, e.g. 'bind', 'prototype' etc
          }
          let real = Object.getOwnPropertyDescriptor(target, prop)
          let desc = {
            enumerable: !!real.enumerable,
            get: getter.bind(target, prop),
            set: setter.bind(target, prop)
          }
          Object.defineProperty(proxy, prop, desc)
          propertyMap[prop] = true
        })

        let prototypeOk = true
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(proxy, Object.getPrototypeOf(target))
        } else if (proxy.__proto__) {
          proxy.__proto__ = target.__proto__
        } else {
          prototypeOk = false
        }
        if (handler.get || !prototypeOk) {
          for (let k in target) {
            if (propertyMap[k]) {
              continue
            }
            Object.defineProperty(proxy, k, {
              get: getter.bind(target, k)
            })
          }
        }

        Object.seal(target)
        Object.seal(proxy)

        return proxy
      }

      scope.Proxy.revocable = function (target, handler) {
        let p = new scope.Proxy(target, handler)
        return {
          'proxy': p,
          'revoke': lastRevokeFn
        }
      }

      scope.Proxy['revocable'] = scope.Proxy.revocable
      scope['Proxy'] = scope.Proxy
    })(typeof process !== 'undefined' && {}.toString.call(process) == '[object process]' ? global : self)

    DomSocketHandler = function (map) {
      if (!this instanceof DomSocketHandler) return new DomSocketHandler()
      this.validators = {}
      this.mapping = map
    }

    /*
       Function to ensure that data is valid based on the specified validators.
    */
    DomSocketHandler.prototype.checkRenderConditions = function (data, validators) {
      var _validData = true
      if (!validators) return _validData
      const collectionValidators = validators

      function triggerValidator (func, thisArg, args) {
        if (typeof func != 'function') {
          console.log('Invalid function passed to trigger validator')
          return true
        } else {
          console.log(func)
          return func.apply(thisArg, args)
        }
      }

      var validator
      if (collectionValidators && typeof collectionValidators[Symbol.iterator] === 'function') {
        for (var i in collectionValidators) {
          validator = collectionValidators[i]
          _validData = triggerValidator(validator, null, [data])
          if (!_validData) break
        }
      } else if (Array.isArray(collectionValidators)) {
        for (var i = 0; i < collectionValidators.length; i++) {
          validator = collectionValidators[i]
          console.log(validator)
          _validData = triggerValidator(validator, null, [data])
          // Early return
          if (!_validData) break
        }
      }
      return _validData
    }
    /*
      Handles a socketEvent to a records association and maps it correctly
      in order to ensure it is rendered to the DOM correctly.
    */
    DomSocketHandler.prototype.handleChangedAssociation = function (data, eventName, verb, attribute, action) {
      if (!attribute || !verb || !action || typeof action != 'function') {
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
      console.log(mapping)

      if (!(verb in mapping)) {
        console.log('verb ' + verb + ' does not exist in mapping ' + JSON.stringify(mapping))
        return
      }
      mapping = mapping[verb]

      if (!(attribute in mapping)) {
        console.log('attribute ' + attribute + ' does not exist in mapping ' + JSON.stringify(mapping))
        return
      }

      mapping = mapping[attribute]

      if (!mapping.event) {
        console.log('Mapping.event did not exist in mapping ' + JSON.stringify(mapping))
        return
      }

      if (!this.mapping[mapping.event]) {
        console.log('mapping.event ' + mapping.event + ' does not exist')
        return
      }

      action.call(this, data, mapping.event, true)
    }

    DomSocketHandler.prototype.addedto = function (data, eventName, verb, attribute) {
      this.handleChangedAssociation(data, eventName, verb, attribute, this.created)
    }

    DomSocketHandler.prototype.removedfrom = function (data, eventName, verb, attribute) {
      this.handleChangedAssociation(data, eventName, verb, attribute, this.destroyed)
    }

    /*

      Generic `created` method which responds to incoming data from a `create` event.
      Checks that data is validated based on the specified validation conditions when constructing this object
      and then attempts to render the created data to the specified template and push the data to the specified container.
    */
    DomSocketHandler.prototype.created = function (data, eventName) {
      const _this = this;
      console.log(data)
      console.log('Triggering created for ' + eventName)

      // If we dont have a mapping, log our invalid state and return
      if (!this.mapping || !eventName in this.mapping) {
        console.log('Invalid mapping for ' + eventName)
        return
      }

      // Retrieve the mapping
      const mapping = this.mapping[eventName]

      // Retrieve any validators for this event
      const validators = mapping.validators && mapping.validators.created

      // Check to see if the data passes validation before it is rendered
      if (this.checkRenderConditions(data, validators)) {

        // Check the mapping under this eventName for its render options.
        if (!mapping.renderOpts) {
          console.log('Invalid mapping for ' + eventName + 'no render opts specified')
          return
        }

        function renderData (renderOpts) {

          // Retrieve the template and container for this event
          var template = renderOpts.template
          var container = renderOpts.container

          console.log('Finding template : ' + template)
          console.log('Finding container : ' + container)

          // If they don't exist, return.
          if (!template || !container) {
            console.log('Could not find template or container ')
            return
          }

          // Find our template in the DOM. Atm, this is using JSRender templating engine,
          // but if it were to work for any templating engine how to find the template within the dom
          // and call it would be left down to the user letting us know.
          const $template = $.templates(template)

          // Check to see if our container is a function or a string.
          // If its a function, more processing is required to actually find the right container and the function will
          // be called with the data
          // If its a string, it is simply the ID of the container in which the new data should be rendered.
          const $container = (typeof container == 'function') ? container.call(null, data) : $(container.toString())

          // At this point, we should check to see that we have a valid container and template
          // thats currently in the DOM. If we don't, then we simply return.
          // In the future, this might be ammended in order to add support for enqueuing data to be displayed later.
          // In ajax pages for example, cycling between pages means that certain DOM elements will be
          // removed from the page (including templates and containers) even though this script will still be running
          // behind the scenes in the browser, we can take advantage of this for data cannot be displayed at present
          // and when the container comes back to into the DOM the page can `refreshed` with data awaiting in the queue.
          if (!($container.length) || !$template) {
            console.log('Container or template dom element does not exist')
            return
          }

          if (renderOpts.beforeDataRendered && typeof renderOpts.beforeDataRendered == 'function') {
            data = renderOpts.beforeDataRendered.call(null, data)
          }

          // obtain the HTML structure of the data
          const html = $template.render(data.added || data,renderOpts.viewExtensions || null)
          const $html = $(html)

          // Check to see if we need to remove elements from the DOM according to the spcified options
          if (renderOpts.maxDomElements && $container.children().length >= renderOpts.maxDomElements) {
            if (renderOpts.removeFromDom && typeof renderOpts.removeFromDom == 'function') {
              renderOpts.removeFromDom.call(null, data, $container)
            } else {
              _this.removeFromDom($container, renderOpts)
            }
          }

          // Trigger any callback functions associated with this event
          if (renderOpts.addToDom && typeof renderOpts.addToDom == 'function') {
            renderOpts.addToDom.call(null, data, $html, $container)
          } else {
            if (renderOpts.beforeCreate && typeof renderOpts.beforeCreate == 'function') {
              console.log('Calling before create')
              renderOpts.beforeCreate.call(null, $html,data)
            }
            console.log(renderOpts.renderMethod || 'append' + ' element to container ' + container)
            $html.hide()
            // Render the data to the container
            $container[renderOpts.renderMethod || 'append']($html.fadeIn(1000))

            if(renderOpts.afterCreate && typeof renderOpts.afterCreate == 'function'){
              renderOpts.afterCreate.call(null,data);
            }
          }
        }

        // For each render option, render it.
        if (Array.isArray(mapping.renderOpts)) {
          mapping.renderOpts.forEach(renderData)
        } else {
          renderData(mapping.renderOpts)
        }
      } else {
        console.log('(Created event) :' + JSON.stringify(data) + ' was not validated')
      }
    }

    /*
      Finds an element from within the dom based on a number of conditions.
      However,primarily this function uses the returned socket data's id attribute and searches
      for an element in the dom with the attribute [data-attr-id="data.id"].
      This however needs to be narrowed down should there be multiple container/templates
      using the domsockethandler on the same page. It could happen that, two elements
      from different tables or databases have the same data-attr-id attribute, in which case
      one of the following options have to be used:

               findInDom -    A callback function which receives the data to be rendered,
                              and based on that data should return the id, or element
                              within the dom. This gives the instantiator of a DomSocketHandler
                              the responsibility of finding the DOM element based on the given data.

               idDomElement - Specifies the type of dom element e.g `li` or `div`
                              that is the root element of the associated html template
                              so that it can be used to further narrow down returned results.
                              This narrows down the dom search further.

               useEventName - if true, data-attr-eventName should be specified within the template markup.
                              This is the best solution and will eliminate finding multiple DOM elements for
                              a single id (should the ids be unique, which they should be).

    */
    DomSocketHandler.prototype.findInDom = function (data, $container, mapping, eventName) {
      if (!mapping || !mapping.renderOpts) {
        console.log('Cannot find element in dom, render opts do not exist ')
        return null
      }

      var findDomElement = mapping.renderOpts.findInDom;

      var $updatedDomElement = null
      if (findDomElement && typeof findDomElement == 'function') {
        $updatedDomElement = $(findDomElement.call(null, data, $container))
      } else if (mapping.renderOpts.idDomElement) {
        if (mapping.renderOpts.useEventName) {
          const findStr = mapping.renderOpts.idDomElelement +
            '[data-attr-eventName="' + eventName + '"]' +
            '[data-attr-id="' + data.id + '"]'
          console.log('Finding : ' + findStr)
          $updatedDomElement = $container.find(findStr)
        } else {
          const findStr = mapping.renderOpts.idDomElelement + '[data-attr-id="' + data.id + '"]'
          console.log('Finding : ' + findStr)
          $updatedDomElement = $container.find(findStr)
        }
      } else {
        if (mapping.renderOpts.useEventName) {
          const findStr = '[data-attr-eventName="' +
            eventName + '"]' +
            '[data-attr-id="' + data.id + '"]'
          console.log('Finding : ' + findStr)
          $updatedDomElement = $container.find(findStr)
        } else {
          const findStr = '[data-attr-id="' + data.id + '"]'
          $updatedDomElement = $container.find(findStr)
        }
      }

      return $updatedDomElement
    }

    // Remove children from the container, using an effect if one is specified otherwise
    // defaulting to fadeOut at 1000ms
    DomSocketHandler.prototype.removeFromDom = function ($container, renderOpts) {
      // Retrieve the child element of this container, default to last if no other options speicified.
      const $childEle = $container.children()[renderOpts.childRemovalMethod || 'last']()
      console.log($childEle)
      // Retrieve the removal effect to apply to the DOM element being removed
      const _removeEffect = (Array.isArray(renderOpts.removeEffect) && renderOpts.removeEffect.length &&
        renderOpts.removeEffect.slice(0, 1)[0]) || 'fadeOut'
      console.log(_removeEffect)
      // Retrieve the params to be passed to the function
      const _params = (Array.isArray(renderOpts.removeEffect) &&
      renderOpts.removeEffect.length &&
      renderOpts.removeEffect.slice(1, renderOpts.removeEffect.length)) || [1000]
      console.log(_params)
      // Apply the effect and remove the element from the DOM.
      $childEle[_removeEffect].apply($childEle, _params).remove()
    }

    // Userprofilecomment
    DomSocketHandler.prototype.updated = function (data, eventName) {
      const _this = this;
      // Check to make sure we have a mapping
      if (!this.mapping) {
        console.log('Invalid state in $.DomSocketHandler, mapping does not exist')
      }

      // Check that this event exists within the mapping
      if (!eventName in this.mapping) {
        console.log(eventName + 'does not exist in mapping ' + this.mapping)
      }

      // Retrieve our mapping
      const mapping = this.mapping[eventName]

      if (!mapping.renderOpts) {
        console.log('No render opts for ' + eventName)
        return
      }

      // Retrieve any validators associated with this event
      const validators = mapping.validators && mapping.validators.updated

      // Check the render conditions for this data (validates if it should be displayed or not)
      if (this.checkRenderConditions(data, validators)) {
        function renderData (renderOpts) {
          // Retrieve our template and container
          var template = renderOpts.template
          var container = renderOpts.container

          // Make sure they exist
          if (!template || !container) {
            console.log('invlaid template or container for updated event')
            return
          }

          // Make sure they exist within the dom
          const $container = $(container)
          const $template = $.templates(template)

          // If they don't exist within the DOM, return.
          if (!$container.length || !$template) {
            console.log('Could not find dom element ')
            return
          }

          // Retrieve our HTML structure
          const $html = $($template.render(data,renderOpts.viewExtensions || {}))


          // If updateInDom cb specified, call that and allow instantiator to add the html to the dom,
          // otherwise do it ourselves with specified options.
          if (renderOpts.updateInDom) {
            renderOpts.updateInDom.call(null, data, $html, $container)
          } else {
            
            // Try and find the updated dom element
            const $updatedDomElement = _this.findInDom(data, $container, mapping, eventName)

            // If we cant find it,log and return
            if (!$updatedDomElement || !($updatedDomElement.length)) {
              console.log('Unable to find update element in dom for data ' + JSON.stringify(data))
              return
            }

            const updateEffect = (renderOpts.updateEffect &&
              Array.isArray(renderOpts.updateEffect) && renderOpts.updateEffect.length &&
              renderOpts.updateEffect.slice(0, 1)) || 'fadeOut'

            const _params = (renderOpts.updateEffect && Array.isArray(renderOpts.updateEffect) &&
            renderOpts.updateEffect.length &&
            renderOpts.updateEffect.slice(1, renderOpts.updateEffect.length)) || [1000]

            _params.append(function () {
              $html.hide()
              $updatedDomElement.replaceWith($html.fadeIn(1000))
            })

            $updatedDomElement[updateEffect].call(null, _params)
          }
        }

        if (Array.isArray(mapping.renderOpts)) {
          mapping.renderOpts.forEach(renderData)
        } else {
          renderData(mapping.renderOpts)
        }
      } else {
        console.log('(Updated event) :' + JSON.stringify(data) + ' was not validated')
      }
    }

    DomSocketHandler.prototype.destroyed = function (data, eventName) {
      const _this = this;

      if (!this.mapping) {
        console.log('Invalid state of $.DomSocketHandler in destroyed')
      }

      if (!eventName in this.mapping) {
        console.log(eventName + ' does not exist in mapping ' + this.mapping)
        return
      }

      const mapping = this.mapping[eventName]

      if (!mapping.renderOpts) {
        console.log('No render opts for,returning ' + eventName)
        return
      }

      const validators = mapping.validators
      if (this.checkRenderConditions(data, validators)) {
        function renderData () {
          var container = renderOpts.container

          if (!container) {
            console.log('Invalid container for remove')
            return
          }

          const $container = $(container)

          if (!$container.length) {
            console.log('could not find container in remove')
            return
          }

          const $domEle = _this.findInDom(data, $container, mapping)
          if ($domEle && $domEle.length) {
            if (destroyInDom) {
              destroyInDom.call(null, data, $container)
            } else {
              _this.removeFromDom($container, renderOpts)
            }
          } else {
            console.log('Could not find dom element to remove')
          }
        }

        if (Array.isArray(mapping.renderOpts)) {
          mapping.renderOpts.forEach(renderData)
        } else {
          renderData(mapping.RenderOpts)
        }
      } else {
        console.log('Did not pass validaiton conditions ' + JSON.stringify(data))
      }
    }

    DomSocketHandler.prototype.loadedFromSocket = function (data, eventName) {
      console.log('In loaded from socket event : ' + eventName)
      console.log('Mapping :' + JSON.stringify(this.mapping))
      if (!(this.mapping)) {
        console.log('Invalid mapping in loaded from socket')
      }

      if (!(eventName in this.mapping)) {
        console.log(eventName + ' does not exist in mappings ')
      }

      const mapping = this.mapping[eventName]

      if (this.checkRenderConditions(data, mapping.validators)) {
        this.created(data, eventName)
      } else {
        console.log('(Loaded event) :' + JSON.stringify(data) + ' was not validated')
      }
    }

    const DataLoaderProto = {

      /*
          Adds an event.
      */
      on: function (attr, func) {
        const _this = this

        if (!attr) return false

        if (Array.isArray(attr)) {
          attr.forEach(function (a) {
            _this.events[a] = _this.events[a] || []
            _this.events[a].push(func)
          })
        } else {
          _this.events[attr] = _this.events[attr] || []
          _this.events[attr].push(func)
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
      /*
          Triggers an event
      */
      trigger: function (attr, thisArg, paramArgs) {
        if (Array.isArray(attr) && attr.length) {
          if (!Array.isArray(this.events[attr[0]])) return
          this.events[attr[0]].forEach(function (l) {
            var obj = l
            var _this = thisArg || obj
            for (var i = 1; i < attr.length; i++) {
              obj = (attr[i] in obj && obj[attr[i]]) || (attr[i] in obj.__proto__ && obj.__proto__[attr[i]])
            }
            if (typeof obj == 'function') obj.apply(_this, paramArgs)
            if (Array.isArray(obj)) {
              obj.forEach(function (c) {
                if (typeof c == 'function') c.apply(_this, paramArgs)
              })
            }
            return
          })
        }
        if (this.events[attr]) {
          console.log(this.events[attr])
          this.events[attr].forEach(function (f) {
            if (typeof f === 'function')
              f.apply(thisArg, paramArgs)
          })
        }
      },
      /*
          Adds a target path to this socket loader.
      */
      addTarget: function (options) {
        const _dataHandler = this

        /* Gather our vars */
        var eventName = options.eventName,
          path = options.path,
          query = options.params,
          subcriteria = options.subcriteria,
          where = options.where

        /*where:{userProfile:1,isReply:false},
        subcriteria:{limit:5:sort:'created ASC'}
        params:{limit:10, sort:'createdAt ASC'},*/

        // Extract this function to a more generic file later, takes an object and turns it into query params
        // e.g 
        /*
            const obj{
              foo:'one',
              bar:'two'
            }

            would become /initialPath/?foo=one&
        */
        function objectToHttpQueryString (initial, query) {
          if (!query) return initial

          if(initial.endsWith('/')) initial = initial.slice(0,intial.length-1);

          var qString = '?'
          for (var key in query) {
            if (key)
              qString = qString.concat(key + '=' + query[key] + '&')
          }
          //Remove trailing/leadig white space, remove last &.
          var path = (initial || '').toString().concat(qString.slice(0,qString.length-1).trim().replace("/'/g", '').replace('/"/g', ''));
          return path;
        }

        /*
            Constructs our final endpoint path.
        */
        var fpath = objectToHttpQueryString(path, query)

        console.log(where)
        console.log(subcriteria)
        if (where) fpath = fpath.concat('&where='.concat(JSON.stringify(where)))
        if (subcriteria) fpath = fpath.concat('&subcriteria='.concat(JSON.stringify(subcriteria)))

        console.log('Adding target ' + fpath)

        /*
            Handler function for incoming socket events
        */
        function handlerFn (data, jwRes) {

          /*Event trigger*/
          function handleSocketEvent (eventName, verb, attribute, data) {
            console.log('Recieved socket event : ' + eventName);
            console.log(data)

            if (!eventName || !verb || !data) {
              console.log('Invalid params passed to trigger')
              return
            }

            if (attribute) {
              _dataHandler.trigger([eventName, verb], null, [data.data || data, eventName, verb, attribute || null])
            } else {
              _dataHandler.trigger([eventName, verb], null, [data.data || data, eventName])
            }
          }

          // Get the verb from the data
          const verb = data.verb.toLowerCase()
          const attribute = (data.attribute && data.attribute.toLowerCase()) || null

          // Trigger/handle incoming data from the socket stream
          handleSocketEvent(eventName, verb, attribute, data)
        }

        /*
            Constructs a new promise to be executed in the future
            when loadAndListen is called on this data loader.
        */
        function target () {
          const _endPointTarget = this

          return new Promise(function (resolve, reject) {
            io.socket.get(fpath, function (data, jwRes) {
              console.log('Receieved data from path ' + fpath)
              console.log(data)
              console.log('Response was:' + jwRes.statusCode)

              if (jwRes.statusCode != 200)
                return reject(new Error('Invalid response code in repsonse handler'))

              // Make sure nothing existing is under this event name with the same handlerFN
              io.socket.off(eventName, _endPointTarget.handlerFn)
              // Listen for incoming socket events
              io.socket.on(eventName, _endPointTarget.handlerFn)

              return resolve(data)
            })
          })
        }

        /*
            Finally add the constructed target to our container
        */
        this.endPointTargets.push({
          eventName,
          fpath,
          handlerFn,
        target})
      },
      loadAndListen: function () {
        const _this = this

        if (this.isLoaded) {
          _this.endPointTargets.forEach(function (t) {
            io.socket.off(t.eventName, t.handlerFn)
            if (this.domReactor) {
              if (t.renderOpts && t.renderOpts.container) {
                $(t.renderOpts.container).empty()
              }
            }
          })
          _this.trigger('reload')
          _this.isLoaded = false
        }

        return Promise.all(_this.endPointTargets.map(function (t) {
          return t.target()
        }))
          .then(function (results) {
            const fResult = Object.assign.apply(null, [{}].concat(_this.endPointTargets.map(function (x, indx) {
              const obj = []
              obj[x.eventName] = results[indx]
              return obj
            })))

            console.log(fResult)

            _this.isLoaded = true
            _this.trigger('load', fResult)

            for (key in fResult) {
              if (Array.isArray(fResult[key])) {
                console.log('Notifiying all : ' + JSON.stringify(fResult[key]))
                console.log('Events: ')
                console.log(_this.events[key])
                console.log(JSON.stringify(_this.events[key]))

                fResult[key].forEach(function (dataObj) {
                  console.log('Triggering ' + key + ' loadedFromSocketEvent with ' + JSON.stringify(dataObj))
                  _this.trigger([key, 'loadedFromSocket'], null, [dataObj, key])
                })
              } else {
                _this.trigger([key, 'loadedFromSocket'], null, [fResult[key], key])
              }
            }
            _this.trigger('finishedLoadFromSocket',{})
            return Promise.resolve(fResult)
          }).catch(function (err) {
          console.log(err)
          Promise.reject(err)
        })
      }
    }

    domSocketHandler = function (map) {
      return new DomSocketHandler(map)
    }

    $.domReactor = function (options) {

      /*
        Construct a new socketDataLoader
      */
      const socketDataLoader = Object.assign(Object.create(DataLoaderProto), {
        events: {},
        endPointTargets: [],
        isLoaded: false,
        domReactor: options && options.domReactor || false
      })

      // If no options are specified, just return a new SocketDataLoader.
      if (!options) return socketDataLoader

      if (options.targets && Array.isArray(options.targets)) {
        // Loop each target, adding it to the socket data loader
        options.targets.forEach(function (t) {
          if (t.eventName && t.path) {
            socketDataLoader.addTarget({
              eventName: t.eventName,
              path: t.path,
              params: t.params || null,
              where: t.where || null,
              subcriteria: t.subcriteria || null
            })
          } else {
            // If theres no event name, just log it.
            console.log('Did not add ' + t.eventName + ' to loader paths,path or eventName not specofied')
          }

          // Check to make sure that the target has the right options.
          if (options.domReactor) {
            if(Array.isArray(t.renderOpts)){
              t.renderOpts.forEach(function(opt){
                if(!opt || !opt.template || !opt.container){
                      throw new Error('Invalid params to $.domReactor for ' + t.eventName + ' ' + JSON.stringify(opt))
                }
              })
            } else if ((!t.renderOpts || !t.renderOpts.template || !t.renderOpts.container)){
              console.log(JSON.stringify(t))
              throw new Error('Invalid params to $.domReactor ')
            }
          }

          // Function to hook dom nodes, that is, when they are added to the DOM callback
          // function is triggered. This is a solution to AJAX pages,
          // where not all containers may be present on a page at once.
          // This function should be extracted to a more generic file later.
          function listenForDomNode (containerSelector, elementSelector, callback) {
            var onMutationsObserved = function (mutations) {
              mutations.forEach(function (mutation) {
                if (mutation.addedNodes.length) {
                  var elements = $(mutation.addedNodes).find(elementSelector)
                  for (var i = 0, len = elements.length; i < len; i++) {
                    callback(elements[i])
                  }
                }
              })
            }
            var target = $(containerSelector)[0]
            var config = {
              childList: true,
              subtree: true
            }
            var MutationObserver = window.MutationObserver || window.WebKitMutationObserver
            var observer = new MutationObserver(onMutationsObserved)
            observer.observe(target, config)
          }

          // The current container for this target
          const container = t.renderOpts.container

          /*
              Listens for a containers entry within the DOM.
              Should the container appear, we empty the container to make sure
              no existing child nodes are within it, and then when reload the data.
          */
          listenForDomNode('body', container, function (element) {
            console.log('Found container :' + container)

            $(container).empty()

            console.log('Emptying container.')

            console.log(socketDataLoader.endPointTargets)
            console.log(t.eventName)
            // The target endpoint that needs to be retriggered and data reloaded
            const targetEndpoint = socketDataLoader.endPointTargets.find(function (targ) {
              return targ.eventName == t.eventName
            })

            // If we didn't find it, something went wrong...
            if (!targetEndpoint) throw new Error('Something went wrong finding endpoint target')

            console.log('Found target endpoint, path was : ' + targetEndpoint.fpath)

            // Retrieve the promise associated with the target end point, and reload the data.
            targetEndpoint.target().then(function (data) {
              console.log('Loaded data: ')
              console.log(data)
              if (Array.isArray(data)) {
                // Fire off multiple events for each data object in the returned array.
                data.forEach(function (dataObj) {
                  console.log('Triggering event under name :' + t.eventName)
                  console.log(dataObj)
                  console.log(socketDataLoader.events)
                  socketDataLoader.trigger([t.eventName, 'loadedFromSocket'], null, [dataObj, t.eventName])
                })
              } else {
                // Otherwise, its a simple data object just fire one event.
                socketDataLoader.trigger([t.eventName, 'loadedFromSocket'], null, [data, t.eventName])
              }
            }).catch(function (err) {
              console.log(err)
              return
            })
          })
        })
      }

      if (options.domReactor) {
        const listenTo = options.targets
          .filter(function (t) {
            return t.eventName && t.shouldListen
          })
          .map(function (t) {
            return t.eventName
          })

        var mapping = options.targets.map(
          function (x) {
            const obj = {}
            obj[x.eventName] = x
            return obj
          }).reduce(function (prev, cur) {
          return Object.assign(prev, cur)
        }, {})

        socketDataLoader.on(listenTo, domSocketHandler(mapping))
      }

      if (options.autoLoad) {
        socketDataLoader.loadAndListen().catch(function (err) {
          if (options.onError && typeof options.onError == 'function')
            options.onError.call(null, err)
        })
      }

      return socketDataLoader
    }
  })(jQuery, window.io)
})
