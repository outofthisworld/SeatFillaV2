module.exports = function json403(data, error, errorMessage) {
    if (data === Object(data) && error) {
        data.error = error;
        data.errorOutput = error.message;
        data.errorMessage = errorMessage;
    }

    return res.json(ResponseStatus.CLIENT_BAD_REQUEST, data);
}