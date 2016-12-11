$(document).ready(function () {
  (function retrieveCurrencies () {
    const displayCurrencies = function (object, selectedOption) {
      object.Currencies.forEach(function (result) {
        const option = $('<option></option>').attr('value', result.Code)
          .attr('data-symbol', result.Symbol).text(result.Code + ' (' + result.Symbol + ')')

        if (result.Code === (selectedOption || 'USD')) {
          option.attr('selected', 'selected')
        }

        $('#seatfilla_currencies').append(option)
      })
    }

    window.seatfilla.globals.cache.get({
      key: 'sf-currencies',
      success: function (status, result) {
        function display (data) {
          window.seatfilla.globals.locale.getPrefferedCurrency(function (status, result) {
            console.log('Status was: ' + status + ' Retrieve preffered currency ' + JSON.stringify(result))
            if (status != 200 || !result) {
              displayCurrencies(data, 'USD')
            } else {
              displayCurrencies(data, result)
            }
          })
        }

        if (status == 200 && result) {
          display(result)
          return
        }

        const type = window.seatfilla.globals.site.endpoints.lookupservice.getCurrencyCodes.method
        const url = window.seatfilla.globals.site.endpoints.lookupservice.getCurrencyCodes.url
        $.ajax({
          type,
          url,
          success: function (response, textstatus, xhr) {
            response = JSON.parse(response)
            console.log(response)
            if (xhr.status == 200) {
              window.seatfilla.globals.cache.put({
                key: 'sf-currencies',
                data: response,
                success: function () {},
                useServerStore: false
              })
              display(response)
            } else {
              console.log('Could not load currencies')
              $('#seatfilla_currencies').remove()
            }
          }
        })
      }
    })

    const errors = [];
    $('#seatfilla_currencies').on('change', function () {
      console.log('trigger sf currency change');

      const currencyCodePreference = $(this).val()

      window.seatfilla.globals.locale.setPrefferedCurrency(currencyCodePreference, function (status) {
        if (status == 200) {
          console.log('Succesfully updated user currency code preference')
        } else {
          console.log('Error updating user currency code preference')
        }
      })

      /*
        Finds prices, currency codes and currency symbols specified within
        <span data-attr-price> DOM elements and changes their currency based
        on the users currency preference.
      */
      $('span[data-attr-price]').each(function (index,ele) {
        console.log('Looping change price ' + index)
        var $this = $(ele)

        var newCurrencyCode = $('#seatfilla_currencies').val()
        var newCurrencySymbol = $('#seatfilla_currencies option:selected').attr('data-symbol')

        var $currencyCode = $this.find('span[data-attr-currency-code]')
        var $amount = $this.find('span[data-attr-amount]')
        var $currencySymbol = $this.find('span[data-attr-currency-symbol]')

        console.log($currencyCode)
        console.log($amount)
        console.log($currencySymbol)

        if (!$currencyCode || !$amount || !$currencySymbol) {
          console.log('Invalid price format')
        }

        var currencyCode = $currencyCode.attr('data-attr-currency-code')
        var amount = $amount.attr('data-attr-amount')
        var currencySymbol = $currencySymbol.attr('data-attr-currency-symbol')

        if (newCurrencyCode == currencyCode) {
          console.log(newCurrencyCode + ' ' + currencyCode)
          console.log('currency codes are the same ' )
        }

        window.seatfilla.globals.getFixerIoExchangeRates(currencyCode, function (err, exchangeRates) {
          if (err) {
            errors.push(err);
            return
          }

          if (!exchangeRates) {
            alert('Error: returned exchange rates were undefined')
            return
          }

          if (!(newCurrencyCode in exchangeRates.rates)) {
            console.log('Could not find : ' + newCurrencyCode + ' in exhcangeRates.rates')
            return
          }
          console.log('Found :' + currencyCode + ' ' + amount + ' ' )
          console.log('Converting to: ' + newCurrencyCode)
          console.log('Conversion rate: ' + exchangeRates.rates[newCurrencyCode])
          const conversionRate = parseFloat(exchangeRates.rates[newCurrencyCode]);
          var newAmount = parseFloat(amount) * conversionRate;
          console.log('After :' + newAmount + ' ' + newCurrencyCode)
          console.log('To fixed: ' + newAmount.toFixed(2))


          $currencyCode.attr('data-attr-currency-code', newCurrencyCode)
          $currencySymbol.attr('data-attr-currency-symbol', newCurrencySymbol)
          $amount.attr('data-attr-amount', newAmount)
          $currencyCode.text(newCurrencyCode)
          $currencySymbol.text(newCurrencySymbol)
          $amount.text(newAmount.toFixed(2))
        })
        //$('span[data-attr-currency-code]').attr('data-attr-currency-code',newCurrencyCode);
        //$('span[data-attr-currency-code]').text(newCurrencyCode);
        //$('span[data-attr-currency-symbol]').attr('data-attr-currency-symbol',newCurrencySymbol);
        //$('span[data-attr-currency-symbol]').text(newCurrencySymbol);
      })

      /*
          Takes elements on a page specified with data-attr-min and data-attr-max
          and data-attr-currency and changes the new min/max of the elements to the users
          selected currency, relative to the base currency specified on the inputs.

          E.G if data-attr-min is set to 1 and data-attr-currency is set to USD,
          then when the users currency is NZD, min becomes 1*(USD-NZD foreign exchange rate).
          Min prices become currency based.
      */
      $('[data-attr-min-price],[data-attr-max-price]').each(function(indx,ele){
        if($(ele).attr('data-attr-currency')){
          console.log('Converting from currency: ' + $(ele).attr('data-attr-currency'))
          window.seatfilla.globals.getFixerIoExchangeRates($(ele).attr('data-attr-currency'),function(err,res){
            if(err){
              //alert(JSON.stringify(err));
              errors.push(err);
              return;
            }else{
              const toCurrency = $('#seatfilla_currencies option:selected').val().toUpperCase();
              console.log('To currency : ' + toCurrency)
              function changeCurrency(attr,base){
                var val = parseFloat($(ele).attr(base)) * parseFloat(res.rates[toCurrency])
                val = parseFloat(val.toFixed(2));
                $(ele).attr('step','0.01')
                $(ele).attr(attr,val);
                $(ele).val(val);
              }

              if($(ele).attr('data-attr-min-price')){
                changeCurrency('min','data-attr-min-price');
                /*var newMin = parseFloat($(ele).attr('min')) * parseFloat(res.rates[toCurrency])
                newMin = parseFloat(newMin.toFixed(2)) + 0.01;
                $(ele).attr('step','0.01')
                $(ele).attr('min',newMin);
                $(ele).val(newMin);*/
              }else{
                changeCurrency('max','data-attr-max-price');
              }
            }
          })
        }
      })
    })
    $('span.userCurrencySymbol').text($('#seatfilla_currencies option:selected').attr('data-symbol'))
    $('span.userCurrencyCode').text($('#seatfilla_currencies option:selected').val())

    if(errors.length){alert(JSON.stringify(errors[0]));}

  })()
})
