var app = angular.module('l3game', ['ngRoute', 'ngResource', 'ngDialog', 'ui.bootstrap'])

.run(function($rootScope, $location, ngDialog) {
    /**
     * Checks if the current button is active
     * @param  {string}  link The path of the button
     * @return {Boolean}      true if the paths are equal.
     */
    $rootScope.isActive = function(link) {
        // get the first part of the path.
        var path = /(\/\w*)\/?/.exec($location.path())[1];
        if (path === link) {
            return true;
        }
        return false;
    };

    /**
     * Opens the sign in modal box.
     */
    $rootScope.signIn = function () {
        ngDialog.open({ 
            template: 'partials/modals/signIn.html',
            controller: 'modalCtrl'
        });
    };
})

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

    .otherwise({
        redirectTo: '/'
    });
});
