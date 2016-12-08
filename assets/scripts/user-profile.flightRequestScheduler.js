$(document).ready(function () {
  (function () {
    console.log('loading scheduler')
    $('#scheduler_here').css('display', 'block')
    window.scheduler.init('scheduler_here', new Date(), 'month')
    window.scheduler.locale.labels.year_tab = 'Year'
    window.scheduler.locale.labels.map_tab = 'My Map'
    window.scheduler.locale.labels.section_template = 'Flight Request Details'
    window.scheduler.templates.lightbox_header = function (start, end, ev) {
      return 'Create a Flight Request'
    }
    window.scheduler.config.lightbox.sections = [

      { name: 'template', height: 600, type: 'template', map_to: 'my_template'}

    ]
    window.scheduler.attachEvent('onBeforeLightbox', function (id) {
      var ev = scheduler.getEvent(id)
      ev.my_template = $('#template').html()
      console.log(ev)
        
      // This needs to be done after the containing function returns true
      // (template doesnt get added until then and at that point a auto generated ID is used.)
      ;(function wait () {
        setTimeout(function () {
          if (scheduler.getState().lightbox_id) {
            const x = scheduler.config.lightbox.sections[0]
            // Kind of hacky, have to find the auto generated container lightbox is putting template in
            const $content = $(($('#' + x.id)[0]).nextElementSibling)
            $content.find('#departure_date').val(moment(ev.start_date).format('YYYY-MM-DD'))
            $content.find('#departure_date_end').val(moment(ev.start_date).format('YYYY-MM-DD'))
            $content.find('#return_date').val(moment(ev.start_date).add(7,'days').format('YYYY-MM-DD'))
            $content.find('#return_date_end').val(moment(ev.start_date).add(7,'days').format('YYYY-MM-DD'))
          } else {
            // Poll again
            wait()
          }
        }, 200)
      })()
      return true
    })

    window.scheduler.attachEvent('onEventSave', function (id, e) {
      var ev = scheduler.getEvent(id)
      console.log(ev)
      console.log('clicked save')
      $.ajax({
        url: '',
        data: {

        },
        success: function (res) {},
        error: function () {}
      })
      return false
    })
  })()
})
