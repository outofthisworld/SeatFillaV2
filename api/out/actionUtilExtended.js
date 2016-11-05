
module.exports = {
    coercePK(model){
       if(typeof model == 'string'){
           if(!(model in sails.models))
            throw new Error('Invalid model string specified');

            model = sails.models[model]
       }
       
       if(!('_attributes' in model)){
           throw new Error('Invalid model format');
       }

       for(var key in model._attributes){
           if(!('primaryKey' in model._attributes[key])){
               continue;
           }
           return key;
       }

       return null;
    }
}