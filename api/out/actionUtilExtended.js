module.exports = {
    coercePK(model) {
        const _this = this;
        for (var key in _this.retrieveAttributes(model)) {
            if (!('primaryKey' in model._attributes[key])) {
                continue;
            }
            return key;
        }
        return 'id';
    },
    retrieveAttributes(model) {
        if (typeof model == 'string') {
            if (!(model in sails.models))
                throw new Error('Invalid model string specified');

            model = sails.models[model]
        }

        if (!('_attributes' in model)) {
            throw new Error('Invalid model format');
        }

        return model._attributes;
    }
}