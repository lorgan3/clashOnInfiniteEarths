var app = angular.module('l3game', ['ngRoute', 'ngResource', 'ngDialog', 'ui.bootstrap'])

.run(function($rootScope, ngDialog, Players) {
    $rootScope.user = undefined;

    // Log in if the user has a token cookie.
    if (getCookie('token') !== '') {
        Players.sendToken({}, function(data) {
            $rootScope.user = {id: data.id, name: data.name, joindate: data.joindate};
        });
    }

    /**
     * Checks if the current button is active
     * @param  {string}  link The path of the button
     * @return {Boolean}      true if the paths are equal.
     */
    $rootScope.isActive = function(link) {
        // get the first part of the path.
        var path = /(\/\w*)\/?/.exec(window.location.hash);
        if (path === null) {
            return link === '/';
        }

        if (path[1] === link) {
            return true;
        }
        return false;
    };

    /**
     * Checks if the user is signed in.
     * @return {boolean} True if the user is signed in.
     */
    $rootScope.signedIn = function() {
        return this.user !== undefined;
    };

    /**
     * Checks if the header should be displayed. It shouldn't be displayed on the game pages.
     * @return {boolean} True if the header should be shown.
     */
    $rootScope.showHeader = function() {
        var path = /(\/\w*)\/?/.exec(window.location.hash);
        if (path !== null && path[1] === '/play') {
            return false;
        }

        return true;
    }

    /**
     * Opens the sign in modal box.
     */
    $rootScope.signIn = function () {
        ngDialog.open({
            template: 'partials/modals/signIn.html',
            controller: 'modalCtrl',
            data: {modelname: 'user', rememberme: true}
        });
    };

    /**
     * Signs the user out.
     */
    $rootScope.signOut = function() {
        this.user = undefined;
        setCookie('token', undefined, -1);
    };
})

.constant('apiKey', 'JaTQVBvA-FdfP6542-jzeTXp4R-HtSQHCHm-ckJUY9HD')
.constant('apiPath', 'http://' + window.location.hostname + ':8080/project2/api')

.config(function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'partials/home.html',
        controller: 'homeCtrl'
    })

    $routeProvider.when('/scores/', {
        templateUrl: 'partials/scores.html',
        controller: 'scoresCtrl'
    })

    $routeProvider.when('/wiki/', {
        templateUrl: 'partials/wiki.html',
        controller: 'wikiCtrl'
    })
    $routeProvider.when('/wiki/:id/', {
        templateUrl: 'partials/wiki.html',
        controller: 'wikiCtrl'
    })

    $routeProvider.when('/play/:key/', {
        templateUrl: 'partials/game.html',
        controller: 'gameCtrl'
    })

    $routeProvider.when('/play/', {
        templateUrl: 'partials/game.html',
        controller: 'gameCtrl'
    })

    .otherwise({
        redirectTo: '/'
    });
});

/**
 * Global cookie functions (http://www.w3schools.com/js/js_cookies.asp)
 */
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
};

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
};
