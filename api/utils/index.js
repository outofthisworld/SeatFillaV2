/*

    Utilities module created by Dale.

    require(./../utils) from within servers/responses/policies/models/controllers
    in order to make use of all utils exported by this file.

    This is a convenience module and exports all application created utility modules,
    however if a class does not make use of most of the exported utility modules
    it would probably make more sense to import the indivual utility files.

    For example: require(./../utils/ErrorUtils) to require just error utilities.
*/


const ErrorUtils = require('./ErrorUtils');
const ArrayUtils = require('./ArrayUtils');

module.exports = {
    ErrorUtils,
    ArrayUtils,
}