$(document).ready(function(){
    $('.commentForm').ajaxForm($.ajaxFormHandler({
        errorMessage:'Comment not recorded',
        successMessage:'Successfully commented on user profile'
    }))

    $('.comments-list').on('click','.show-reply-panel',function(){
         const panelId = $(this).attr('data-attr-reply-panel');
         $('.reply-panel[data-attr-panel-id="'+panelId+'"]').hide().toggleClass('hide').slideToggle(100)
    })
})