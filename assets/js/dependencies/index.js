(function($) {
    $(document).ready(function() {
        $(".player").mb_YTPlayer();
        $(document).ready(function() {
            if (!device.tablet() && !device.mobile()) {
                $('.video-controls').addClass(
                    'video-controls-visible');
            }
        });

        $('#video-play').click(function(event) {
            event.preventDefault();
            if ($(this).hasClass('ion-ios-play')) {
                $('.player').playYTP();
            } else {
                $('.player').pauseYTP();
            }
            $(this).toggleClass('ion-ios-play ion-ios-pause');
            return false;
        });

        $('#video-volume').click(function(event) {
            event.preventDefault();
            $('.player').toggleVolume();
            $(this).toggleClass('ion-android-volume-mute ion-volume-high');
            return false;
        });

    });
})(jQuery);


var isPhoneDevice = "ontouchstart" in document.documentElement;
$(document).ready(function() {
    if (isPhoneDevice) {
        //mobile
    } else {
        //desktop
        // Initialize WOW.js
        wow = new WOW({
            offset: 50
        })
        wow.init();
    }
});


$(document).ready(function() {
    if (!device.tablet() && !device.mobile()) {
        $(".parallax").addClass("fixed");
        $window = $(window);
        $('section[data-type="background"]').each(function() {
            var $scroll = $(this);
            $(window).scroll(function() {
                var yPos = -(($window.scrollTop() - $scroll.offset().top) / $scroll.data('speed'));
                var coords = '50% ' + yPos + 'px';
                $scroll.css({
                    backgroundPosition: coords
                });
            });
        });
        $(window).scroll(function() {
            var scroll = $(window).scrollTop();
            $('.site-wrapper-inner').css({
                'opacity': ((200 - scroll) / 400) + 0.4
            });
        });

        /* Create HTML5 element for IE */
        document.createElement("section");
    }
});