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
                    .attr('data-symbol', result.Symbol).text(result.Code + ' (' + result.Symbol + ')');

                if (result.Code === (selectedOption || 'USD')) {
                    option.attr('selected', 'selected');
                }

                $('#seatfilla_currencies').append(option);
            })
        }

        window.seatfilla.globals.cache.get({
            key: 'sf-currencies',
            success: function(status, result) {
                console.log(status);
                console.log(result);

                function display(data) {
                    window.seatfilla.globals.locale.getPrefferedCurrency(function(status, result) {
                        console.log('Status was: ' + status + ' Retrieve preffered currency ' + JSON.stringify(result));
                        if (status != 200 || !result) {
                            displayCurrencies(data, 'USD');
                        } else {
                            displayCurrencies(data, result);
                        }
                    })
                }
                if (status != 200 || !result) {
                    const type = window.seatfilla.globals.site.endpoints.lookupservice.getCurrencyCodes.method;
                    const url = window.seatfilla.globals.site.endpoints.lookupservice.getCurrencyCodes.url;
                    $.ajax({
                        type,
                        url,
                        success: function(response, textstatus, xhr) {
                            response = JSON.parse(response);
                            console.log(response);
                            if (xhr.status == 200) {
                                window.seatfilla.globals.cache.put({
                                    key: 'sf-currencies',
                                    data: response,
                                    success: function() {},
                                    useServerStore: false
                                });
                                display(response);
                            } else {
                                console.log('Could not load currencies');
                                $('#seatfilla_currencies').remove();
                            }
                        }
                    });

                } else {
                    display(result);
                }
            }
        });


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
    })();

});