/*
    Created by Dale.

    Loads currencies on each page load and users currency preference on page load, 
    uses client side session storage if applicable to reduce page load times.
*/

$(document).ready(function() {

    (function retrieveCurrencies() {
        const displayCurrencies = function(object, selectedOption) {
            object.Currencies.forEach(function(result) {
                const option = $('<option></option>').attr('value', result.Code)
                    .attr('data-symbol', result.Symbol).text(result.Code);

                if (result.Code === (selectedOption || 'USD')) {
                    option.attr('selected', 'selected');
                }

                $('#seatfilla_currencies').append(option);
            })
        }


        /* Get the cached values if they exist */
        var cacheVal = window.seatfilla.globals.cache.get({ key: 'sfCur', type: 'session' });
        if (cacheVal) {
            console.log('Loading currencies from cache');
            window.seatfilla.globals.locale.getPrefferedCurrency(function(status, prefferedCurrencyCode) {
                displayCurrencies(cacheVal, prefferedCurrencyCode);
            });
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
                        window.seatfilla.globals.cache.put({
                            key: 'sfCur',
                            data: response,
                            type: 'session'
                        });
                        window.seatfilla.globals.locale.getPrefferedCurrency(function(status, prefferedCurrencyCode) {
                            displayCurrencies(response, prefferedCurrencyCode);
                        });
                    } else {
                        alert('Could not load currencies');
                        $('#seatfilla_currencies').remove();
                    }
                }
            });
        }
    })();

    $('#seatfilla_currencies').on('change', function() {
        const currencyCodePreference = $(this).val();
        window.seatfilla.globals.locale.setPrefferedCurrency(currencyCodePreference, function(status) {
            if (status == 200) {
                console.log('Succesfully updated user currency code preference');
            } else {
                console.log('Error updating user currency code preference');
            }
        });
    });
});