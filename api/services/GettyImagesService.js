

const sandBoxApiKey = 'f98wrt5y3p4234r5vecuuf8c';
const sandBoxSecret = 'rf6Wua5AKXMzgEWHbynZQa5WrqrDwe9sQeDD8A42aP8S5';

const embededApiKey = 'uqdsewc7gn79apjzdmd7qkya';
const embededSecret = '3QUvputDkf5UqzWNsA8EhwNfGVGA2GDRW6N6kXEFXXjkt';


var token = null;
var tokenRequestTime = null;
var tokenExpiraryTime = 1800; //In seconds


module.exports = {
    getToken(){
        if(token && tokenRequestTime && ((new Date().getTime() - tokenRequestTime) / 1000) < tokenExpiraryTime) return token;

        tokenRequestTime = new Date().getTime();


        //Make the request


        /*
            POST /token HTTPS/1.1
            Host: api.gettyimages.com/oauth2/token/
            Content-Type: application/x-www-form-urlencoded

            client_id=TestClientId&client_secret=TestSecret&grant_type=client_credentials
        */

    },
    searchImages(options){
        const token = this.getToken();

        //Make the request to search images

    }
}