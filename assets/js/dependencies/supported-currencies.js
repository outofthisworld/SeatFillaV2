/*
    Created by Dale.

    Loads currencies on each page load, uses client side session storage if applicable to reduce page load times.
*/

$(document).ready(function() {

    (function retrieveCurrencies() {
        const displayCurrencies = function(object) {
            object.Currencies.forEach(function(result) {
                const option = $('<option></option>').attr('value', result.Code)
                    .attr('data-symbol', result.Symbol).text(result.Code);

                if (result.Code === 'USD') {
                    option.attr('selected', 'selected');
                }

                $('#seatfilla_currencies').append(option);
            })
        }

        var cacheVal = window.seatfilla.globals.cache.get({ key: 'sfCur', type: 'session' });
        console.log(cacheVal);
        if (cacheVal) {
            console.log('Loading currencies from cache');
            displayCurrencies(cacheVal);
        } else {
            const type = window.seatfilla.globals.site.endpoints.lookupservice.getCurrencyCodes.method;
            const url = window.seatfilla.globals.site.endpoints.lookupservice.getCurrencyCodes.url;
            alert('sending req');
            $.ajax({
                type,
                url,
                success: function(response, textstatus, xhr) {
                    response = JSON.parse(response);
                    if (xhr.status == 200) {
                        if (window.seatfilla.globals.cache.put({
                                key: 'sfCur',
                                data: response,
                                type: 'session'
                            })) {
                            console.log('Succesfully cached currencies');
                        }
                        displayCurrencies(response);
                    } else {
                        alert('Could not load currencies');
                        $('#seatfilla_currencies').remove();
                    }
                }
            });
        }
    })();

    $('#seatfilla_currencies').on('change', function() {

    })
});