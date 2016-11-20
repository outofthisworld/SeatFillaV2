$(window).ready(function () {
  (function ($, io) {
    if (!io || !io) throw new Error('Invalid params')

    $.seatfilla = $.seatfilla || {}
    $.seatfilla.userprofile = $.seatfilla.userprofile || {}
    const userProfileProto = 

    $.seatfilla.userprofile = Object.create(userProfileProto)
  
  })(jQuery, window.io)
})
