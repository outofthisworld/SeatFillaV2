//Create a namespace for this site
window.seatfilla = window.seatfilla || {};
window.seatfilla.globals = window.seatfilla.globals || {};


window.seatfilla.globals.site = {
    baseURL: '127.0.0.1',
    siteName: 'SeatFilla',
}

window.seatfilla.globals.getFirstBrowserLanguage = function() {
    var nav = window.navigator,
        browserLanguagePropertyKeys = ['language', 'browserLanguage', 'systemLanguage', 'userLanguage'],
        i,
        language;
    if (Array.isArray(nav.languages)) {
        for (i = 0; i < nav.languages.length; i++) {
            language = nav.languages[i];
            if (language && language.length) {
                return language;
            }
        }
    }
    for (i = 0; i < browserLanguagePropertyKeys.length; i++) {
        language = nav[browserLanguagePropertyKeys[i]];
        if (language && language.length) {
            return language;
        }
    }
    return null;
};