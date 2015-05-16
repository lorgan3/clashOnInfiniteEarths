var app = angular.module('l3game', ['ngRoute', 'ngResource', 'ngDialog', 'angular-carousel'])

.run(function($rootScope, ngDialog, Players, Scores) {
    $rootScope.user = undefined;
    $rootScope.events = [];

    /**
     * Waits for the player to be logged in before executing the given function.
     * @param {Function} e The function to execute.
     */
    $rootScope.withPlayer = function(e) {
        if (this.user === undefined) {
            this.events.push(e);
        } else {
            e();
        }
    }

    // Log in if the user has a token cookie.
    if (getCookie('token') !== '') {
        Players.sendToken({}, function(data) {
            $rootScope.user = {id: data.id, name: data.name, joindate: data.joindate};

            // Launch all functions that required the player object.
            for(var i in $rootScope.events) {
                $rootScope.events[i]();
            }
            $rootScope.events.length = 0;
        }, function(data) {
            var prefixes = ['incredible', 'amazing', 'invincible', 'unstoppable', 'mighty', 'super', 'mega', 'awesome'];
            $rootScope.user = {id: undefined, name: 'the' + prefixes[Math.floor(Math.random()*prefixes.length)] + 'player', joindate: undefined };

            // Launch all functions that required the player object.
            for(var i in $rootScope.events) {
                $rootScope.events[i]();
            }
        });
    } else {
        var prefixes = ['incredible', 'amazing', 'invincible', 'unstoppable', 'mighty', 'super', 'mega', 'awesome'];
        $rootScope.user = {id: undefined, name: 'the' + prefixes[Math.floor(Math.random()*prefixes.length)] + 'player', joindate: undefined };

        // Launch all functions that required the player object.
        for(var i in $rootScope.events) {
            $rootScope.events[i]();
        };
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
        return this.user !== undefined && this.user.id !== undefined;
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
    $rootScope.showSignIn = function () {
        if (this.user === undefined || this.user.id !== undefined) {
            this.signOut();
        } else {
            ngDialog.closeAll();
            ngDialog.open({
                template: 'partials/modals/signIn.html',
                controller: 'modalCtrl',
                data: {modelname: 'user', model: {rememberme: true}}
            });
        }
    };

    /**
     * Opens the sign up modal box.
     */
    $rootScope.showSignUp = function () {
        ngDialog.closeAll();
        ngDialog.open({
            template: 'partials/modals/signUp.html',
            controller: 'modalCtrl',
            data: {modelname: 'user'}
        });
    };

    $rootScope.getUserId = function() {
        return this.user.id;
    }

    /**
     * Opens the host modal box.
     */
    $rootScope.host = function() {
        if ($rootScope.user.id === undefined) {
            this.showSignIn();
        } else {
            ngDialog.open({
                template: 'partials/modals/host.html',
                controller: 'modalCtrl',
                data: {code: 'host', modelname: 'server', model: {
                    servername: getCookie('servername') || 'My Server',
                    maxplayers: Number(getCookie('maxplayers')) || 4,
                    'private': Boolean(Number(getCookie('private'))) || false,
                    peerserver: getCookie('peerserver'),
                    peerport: Number(getCookie('peerserverport')) || 9000}
                }
            });
        }
    }

    /**
     * Opens the host modal box.
     */
    $rootScope.join = function() {
        ngDialog.open({
            template: 'partials/modals/join.html',
            controller: 'modalCtrl',
            data: {code: 'join'}
        });
    }

    /**
     * Signs the user out.
     */
    $rootScope.signOut = function() {
        this.user = undefined;
        setCookie('token', undefined, -1);
    };

    // Updates the scores in the API.
    $rootScope.sendScore = function(time, playersKilled, asteroidsKilled, won, singleplayer) {
        Scores.update({time: time,
                       playersKilled: playersKilled,
                       asteroidsKilled: asteroidsKilled,
                       won: won,
                       singleplayer: singleplayer},
        function(data) {
            console.log(data);
        });
    };

    // Expose this function so the game can use it.
    app.sendScore = $rootScope.sendScore;
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
        templateUrl: 'partials/play.html',
        controller: 'gameCtrl'
    })

    $routeProvider.when('/play/', {
        templateUrl: 'partials/play.html',
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
