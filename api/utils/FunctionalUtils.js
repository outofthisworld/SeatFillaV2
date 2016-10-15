/*
    This module exports useful functional methods that conform to the same 
    method signatures so that they can be used dynamically within functions as callbacks.

    Created by Dale.
*/

module.exports = {
    greaterThan(amountOne, amountTwo) {
        return amountOne > amountTwo;
    },
    greaterThanOrEqualTo(amountOne, amountTwo) {
        return amountOne >= amountTwo;
    },
    lessThan(amountOne, amountTwo) {
        return amountOne < amountTwo;
    },
    lessThanOrEqualTo(amountOne, amountTwo) {
        return amountOne <= amountTwo;
    },
    equalTo(amountOne, amountTwo) {
        return amountOne == amountTwo;
    },
    add(value1, value2) {
        return value1 + value2;
    },
    subtract(value1, value2) {
        return value1 - value2;
    },
    multiply(value1, value2) {
        return value1 * value2;
    },
    divide(value1, value2) {
        return value1 / value2;
    }
    predicate(value, equals) {
        return value === equals;
    },
    compare(value1, value2) {
        return value1 - value2;
    },
    /*
       Utility function for mapping an array of objects into the specified value.

       [].map(FunctionalUtils.mapTo('someAttr'));
    */
    mapTo(attribute) {
        return function(value) {
            return value[attribute];
        }
    },
    /*
        [].reduce(FunctionalUtils.reduceTo('attr' || null, FunctionalUtils.add));
    */
    reduceTo(attribute, mathFunc) {
        return function(total, value) {
            return mathFunc(total, value[attribute] || value);
        }
    },
    /*
        [].sort(FunctionalUtils.)
    */
    sort(attribute, sortMethod) {
        return function(value1, value2) {
            if (attribute) {
                return (sortMethod == 'ASC' ? value1[attribute] - value2[attribute] :
                    value2[attribute] - value1[attribute]) || value1[attribute] - value2[attribute];
            } else {
                return (sortMethod == 'ASC' ? value1 - value2 : value2 - value1) || value1 - value2;
            }
        }
    }
}