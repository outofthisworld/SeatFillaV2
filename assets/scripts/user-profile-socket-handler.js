$(window).ready(function () {
  (function ($) {
    $.DomSocketHandler = function () {
      if (!this instanceof $.DomSocketHandler) return new $.DomSocketHandler(options)
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
      const mapping = this.options
      if (eventName in mapping && verb in mapping[eventName] && attribute in mapping[eventName][verb]) {
        const mapping = mapping[eventName][verb][attribute]
        if (this[mapping.action])
          this[mapping.action].call(this, data, mapping.renderOpts)
      }
    }

    $.DomSocketHandler.prototype.removedfrom = function (data, eventName, verb, attribute) {
      if (!attribute) return
      const mapping = this.options
      if (eventName in mapping && verb in mapping[eventName] && attribute in mapping[eventName][verb]) {
        const mapping = mapping[eventName][verb][attribute]
        if (this[mapping.action])
          this[mapping.action].call(this, data, mapping.renderOpts)
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
          findInDom = options.findInDom
          destroyInDom = options.destroyInDom
        } else {
          container = this.contianer
          findInDom = this.findInDom
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
        this.renderData(data)
      } else {
        console.log('(Loaded event) :' + JSON.stringify(data) + ' was not validated')
      }
    }
  })(jQuery)
})

$(window).ready(function () {
  const userprofilelink = {
    renderOpts: {
      maxDomElements: 5,
      updatedEffect: function (data, $container, html) {
        $(html).hide().appendTo($container).fadeIn(1000)
      },
      destroyedEffect: function (data, $container, html) {
        $(html).hide().appendTo($container).fadeIn(1000)
      },
      createdEffect: function (data, $container, html) {
        $(html).hide().appendTo($container).fadeIn(1000)
      },
      loadedFromSocketEffect: ['fade', 1000],
      template: options.userprofileimage.template,
      container: options.userprofileimage.container
    }
  }

  const userprofilecommentreply = {
    renderOpts: {
      maxDomElements: 5,
      updatedEffect: ['fade', 1000],
      destroyedEffect: ['fade', 1000],
      createdEffect: ['fade', 1000],
      loadedFromSocketEffect: ['fade', 1000],
      template: '#userprofilecommentreplytemplate',
      container: function (data) {}
    }
  }

  const userprofilecomment = {
    addedTo: {
      replies: {
        action: 'created',
        renderOpts: userprofilecommentreply.renderOpts
      }
    },
    removedFrom: {
      replies: {
        action: 'destroyed',
        template: options.userprofilecommentreply.renderOpts
      }
    },
    renderOpts: {
      maxDomElements: 5,
      updatedEffect: ['fade', 1000],
      destroyedEffect: ['fade', 1000],
      createdEffect: ['fade', 1000],
      loadedFromSocketEffect: ['fade', 1000],
      template: options.userprofileimage.template,
      container: options.userprofileimage.container
    }
  }

  const userprofileimage = {
    renderOpts: {
      maxDomElements: 5,
      updatedEffect: ['fade', 1000],
      destroyedEffect: ['fade', 1000],
      createdEffect: ['fade', 1000],
      loadedFromSocketEffect: ['fade', 1000],
      template: '#userprofileimagetemplate',
      container: '#userprofileimagecontainer'
    }
  }

  const userprofile = {
    addedTo: {
      images: {
        action: 'created',
        renderOpts: userprofileimage.renderOpts
      },
      comments: {
        action: 'created',
        renderOpts: userprofilecomment.renderOpts
      },
      userLinks: {
        action: 'created',
        renderOpts: userprofilelink.renderOpts
      }
    },
    removedFrom: {
      images: {
        action: 'destroyed',
        template: options.userprofile.template,
        container: options.userprofile.container
      },
      comments: {
        action: 'destroyed',
        template: options.userprofilecomment.template,
        container: options.userprofilecomment.container
      },
      userLinks: {
        action: 'destroyed',
        template: options.userprofilelink.template,
        container: options.userprofilelink.container
      }
    },
    renderOpts: {
      maxDomElements: 5,
      updatedEffect: ['fade', 1000],
      destroyedEffect: ['fade', 1000],
      createdEffect: ['fade', 1000],
      loadedFromSocketEffect: ['fade', 1000],
      template: options.userprofiletemplate,
      container: options.userprofile.container
    }
  }

  const y = {
    'flightrequest': {
      maxDomElements: 5,
      updatedEffect: '',
      destroyedEffect: '',
      createdEffect: '',
      loadedFromSocketEffect: '',
      template: options.userprofileimage.template,
      container: options.userprofileimage.container
    },
    'flightgroup': {
      maxDomElements: 5,
      updatedEffect: '',
      destroyedEffect: '',
      createdEffect: '',
      loadedFromSocketEffect: '',
      template: options.userprofileimage.template,
      container: options.userprofileimage.container
    },
    'hotel': {
      maxDomElements: 5,
      updatedEffect: '',
      destroyedEffect: '',
      createdEffect: '',
      loadedFromSocketEffect: '',
      template: options.userprofileimage.template,
      container: options.userprofileimage.container

    },
    'user': {
      maxDomElements: 5,
      updatedEffect: '',
      destroyedEffect: '',
      createdEffect: '',
      loadedFromSocketEffect: '',
      template: options.userprofileimage.template,
      container: options.userprofileimage.container
    },
    'bids': {
      maxDomElements: 5,
      updatedEffect: '',
      destroyedEffect: '',
      createdEffect: '',
      loadedFromSocketEffect: '',
      template: options.userprofileimage.template,
      container: options.userprofileimage.container

    },
    'notifications': {
      maxDomElements: 5,
      updatedEffect: '',
      destroyedEffect: '',
      createdEffect: '',
      loadedFromSocketEffect: '',
      template: options.userprofileimage.template,
      container: options.userprofileimage.container
    }

  }

  $.seatfilla.userprofile.on('load', function () {
    for (var key in options) {
      $.seatfilla.userprofile.socket.on(key, Object.assign(new $.DomSocketHandler(), options[key]))
    }
  })

  $.seatfilla.userprofile.loadprofile()
})
