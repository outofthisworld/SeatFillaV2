/*
    Created by Dale.

    Loads webisite on each page load.
*/

$(document).ready(function() {
    const type = window.seatfilla.globals.site.endpoints.lookupservice.getCurrencyCodes.method;
    const url = window.seatfilla.globals.site.endpoints.lookupservice.getCurrencyCodes.url;

    $.ajax({
        type,
        url,
        success: function(response, textstatus, xhr) {
            if (xhr.status == 200) {
                response.currencies.forEach(function(result) {
                    const option = $('<option></option>').attr('value', result.Code)
                        .attr('data-symbol', result.Symbol).text(result.Code);
                    $('#seatfilla_currencies').append(options);
                })
            } else {
                alert('Could not load currencies');
                $('#seatfilla_currencies').remove();
            }
        }
    });
});