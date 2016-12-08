/*
    Handles logging into the website.

    Created by Dale.
*/


$(document).ready(function() {
    $('#login-modal-trigger').on('click', function() {
        $('#login-modal').load('/ajax/login.ejs', function() {
            var $formLogin = $('#login-form');
            var $formLost = $('#lost-form');
            var $divForms = $('#div-forms');
            var $modalAnimateTime = 300;
            var $msgAnimateTime = 150;
            var $msgShowTime = 2000;

            $('#login-modal form').ajaxForm(function(err, res, jqXHR, textStatus, errorThrown){
                console.log($(this))
                console.log('submit form:')
                console.log(res)
                 $('.errors').html('');
                if(err || !res || res.error || res.errorMessages){
                    $('.errors').html($.templates('#jsonErrorTemplate').render(
                        {errorMessages: (res && (res.errorMessages  || (res.error && [res.error]))) || [errorThrown]}
                    ))
                }else{
                    window.location.href = '/'
                }
            })

            $('#register_login_btn').click(function() {
                modalAnimate($formRegister, $formLogin);
            });
            $('#login_lost_btn').click(function() {
                modalAnimate($formLogin, $formLost);
            });
            $('#lost_login_btn').click(function() {
                modalAnimate($formLost, $formLogin);
            });
            $('#register_lost_btn').click(function() {
                modalAnimate($formRegister, $formLost);
            });

            function modalAnimate($oldForm, $newForm) {
                var $oldH = $oldForm.height();
                var $newH = $newForm.height();
                $divForms.css("height", $oldH);
                $oldForm.fadeToggle($modalAnimateTime, function() {
                    $divForms.animate({
                        height: $newH
                    }, $modalAnimateTime, function() {
                        $newForm.fadeToggle($modalAnimateTime);
                    });
                });
            }

            function msgFade($msgId, $msgText) {
                $msgId.fadeOut($msgAnimateTime, function() {
                    $(this).text($msgText).fadeIn($msgAnimateTime);
                });
            }

            function msgChange($divTag, $iconTag, $textTag, $divClass, $iconClass, $msgText) {
                var $msgOld = $divTag.text();
                msgFade($textTag, $msgText);
                $divTag.addClass($divClass);
                $iconTag.removeClass("glyphicon-chevron-right");
                $iconTag.addClass($iconClass + " " + $divClass);
                setTimeout(function() {
                    msgFade($textTag, $msgOld);
                    $divTag.removeClass($divClass);
                    $iconTag.addClass("glyphicon-chevron-right");
                    $iconTag.removeClass($iconClass + " " + $divClass);
                }, $msgShowTime);
            }
        });
    });
});