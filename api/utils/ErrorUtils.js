/*
    Created by Dale
    Utility class for producing errors that descibe more information about why they occurred.
*/
module.exports = {

  /*
    Logs an error with more indepth details.
    Note that this method cannot be used with asyncronous functions such
    as promises, as the arguments object is inaccessible.
  */
  createNewError(message, callingArgs, optionalCause) {
    const e = new Error(message)
    e.errorCallingFunction = arguments.callee.caller.toString()
    e.InvokerOfErrorProducingFunction = callingArgs.callee.callee.toString()
    e.InvokerOrErrorProducingFunctionArguments = arguments
    e.provokingError = optionalCause || 'None'
    return e
  },
  /*
    Logs an error to a json file.

    Example: 
        require('../../ErrorUtils').errToJson('/Error',new Error(),{useBase:true});
  */
  errToJson(path, error, options, doneCallback) {
    if (options && options.useBase)
      path = require('path').resolve(sails.config.appPath, path)

    if (options && options.useDir)
      path = require('path').resolve(sails.config.appPath, options.useDir, path)

    require('./FileUtils').modJson(path, function (err, jsonObject, done) {
      if (err) { // Error logging to file
        sails.log.error(err)
      } else {
        if (!jsonObject)
          jsonObject = {}

        if (!jsonObject.errors || !Array.isArray(jsonObject.errors))
          jsonObject.errors = []

        jsonObject.errors.push(error)

        return done(jsonObject, doneCallback)
      }
    })
  },
  /*
    Takes a waterline error and converts it into a display friendly error.
    Checks a model to see if it has a validationErrors object defined as such:

    model = {
      validationErrors:{

      }
    }

    The function will check the validationErrors for the corresponding attribute that threw the
    waterline validation error, and then check the rule that failed.

    For example, if a model has a password field and a notNull attribute:

      model = {
        attributes:{
          password:{
            type:'string',
            notNull:true
          }
        }
      }

      and a waterline error is thrown as such:

      E_VALIDATION (ERROR) - 
        {"error":"E_VALIDATION","status":400,"summary":"1 attribute is invalid","model":"User","invalidAttributes":{"password":[{"rule":"notNull","message":"\"equals\" validation rule failed for input: 'null'\nSpecifically, it threw an error.  Details:\n undefined"}]}}

      Should the model be defined like so:

      model={
        attributes:{
          password:{
            type:'string',
            notNull:true
          }
        },
        validationErrors:{
          password:{
            notNull:'Please enter a valid password'
          }
        }
      }

      Then 'please enter a valid password' will be retuned within an errors array to be displayed.

      However, if a model does not define an validationErrors object,
      then this method will attempt to convert attribute properties to a display friendly format,
      converting camelCase, CapitilizedCase and under_score attributes to 

      camel case
      capitalize case
      underscore case

      and append the string 'Invalid input for field : '
  */
friendlyWaterlineError(validationError) {
    sails.log.debug('error: ' +JSON.stringify(validationError))
    if(!validationError || (!validationError.error == 'E_VALIDATION' && !validationError.ValidationError) || !validationError.invalidAttributes) //Just return a friendly response, we can't format the errors
      return 'Error whilst performing this action, please make sure no fields are missing';

    const errors = [],
          model = sails.config.models[validationError.model];

    //Here we will format a nice response
    if(model && model.validationErrors && validationError.invalidAttributes){
        for(var key in validationError.invalidAttributes){
            var invalidAttribute = key;
            validationError.invalidAttributes[key].foreach(function(error){
                const rule = error.rule;
                if(key in model.validationErrors && rule in model.validationErrors[key]){
                   errors.append(model.validationErrors[key][rule]);
                }
            })
        }
    }else if(validationError.invalidAttributes){ //If we haven't defined validation errors in the model
        for(var key in validationError.invalidAttributes){
           var invalidAttribute = key;
           var index = null;
           var count = 0;
           for(var i = 0; i < invalidAttribute.length;i++){
             if(invalidAttribute[i].toUpperCase() == invalidAttribute[i]){
               count++;
               index = i;
             }
          }
           //If we only have one upper
          if(count == 1 || (count == 2 && invalidAttribute[0].toUpperCase() == invalidAttribute[0])){
               const errorMessage = invalidAttribute.substring(0,index) + ' ' + invalidAttribute.substring(index,invalidAttribute.length);
               errors.push('Invalid input for field : ' + errorMessage.toLowerCase()) 
          }else if(invalidAttribute.indexOf('_') != -1){
               errors.push('Invalid input for field : ' + invalidAttribute.split('_').join(' ').toLowerCase())
          }else{
               errors.push('Invalid input for field : ' + invalidAttribute.toLowerCase())
          }
        }
    }
    return errors;
}
}
