$.fn.sfResetForm = function () {
    return this.filter('form, :input').each(function () {
        var input = $(this);
        
        // Reset the form.
        if (input.is('form')) {
            input[0].reset();
            return;
        }

        // Reset any form field.
        if (input.is(':radio, :checkbox')) {
            input.prop('checked', this.defaultChecked);
        } else if (input.is('select')) {
            input.find('option').each(function () {
                $(this).prop('selected', this.defaultSelected);
            });
        } else if (this.defaultValue) {
            input.val(this.defaultValue);
        } else {
            console.log('Cannot reset to default value');
        }
    });
};
