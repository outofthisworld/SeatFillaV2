/*
    Created by Dale

    Utility class for producing errors that descibe more information about why they occurred.
*/
module.exports = {
    createNewError(message, callingArgs, optionalCause){
        const e = new Error(message);
        e.errorCallingFunction = arguments.callee.caller.toString();
        e.InvokerOfErrorProducingFunction = callingArgs.callee.callee.toString();
        e.InvokerOrErrorProducingFunctionArguments = arguments;
        e.provokingError = optionalCause || 'None';
        return e;
    }
}