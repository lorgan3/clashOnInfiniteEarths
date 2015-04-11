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
.controller('modalCtrl', function($scope, ngDialog, $rootScope, Players) {
    // init
    if ($scope.ngDialogData !== undefined) {
        $scope[$scope.ngDialogData.modelname] = $scope.ngDialogData;
    }

    /**
     * Close all dialogs.
     */
    $scope.close = function() {
        ngDialog.closeAll();
    };

    /**
     * Sign in a user.
     */
    $scope.signIn = function() {
        var self = this;
        Players.signIn({username: this.user.username, password: this.user.password}, function(data) {
            setCookie('token', data.token, self.user.rememberme === true ? 365 : 0);
            $rootScope.user = {id: data.id, name: data.name, joindate: data.joindate};
        });

        this.close();
    };

    /**
     * Sign up a user.
     */
    $scope.signUp = function() {
        Players.signUp({username: this.user.username, password: this.user.password}, function(data) {
            setCookie('token', data.token, 365);
            $rootScope.user = {id: data.id, name: data.name, joindate: data.joindate};
        });

        this.close();
    };
});