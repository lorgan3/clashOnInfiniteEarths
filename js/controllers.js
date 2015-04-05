var app = angular.module('l3game')

.controller('homeCtrl', function($scope) {
})

.controller('scoresCtrl', function($scope) {
})

.controller('wikiCtrl', function($scope) {
})

.controller('gameCtrl', function($scope) {
})

// A controller for handling modalboxes. 
.controller('modalCtrl', function ($scope, ngDialog, $rootScope) {
    $scope.close = function() {
        ngDialog.closeAll();
    };

    $scope.signIn = function() {
        console.log('sign in');
        $rootScope.user = this.user;
        this.close();
    };

    $scope.signUp = function() {
        console.log('sign up');
        this.close();
    };
});