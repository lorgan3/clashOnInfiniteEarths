var app = angular.module('l3game')

.controller('homeCtrl', function($scope) {
})

.controller('scoresCtrl', function($scope) {
})

.controller('wikiCtrl', function($scope) {
})

.controller('gameCtrl', function($scope, $rootScope, Games) {
    startGame($rootScope.isHost || false, $rootScope.token, $rootScope.maxplayers, $rootScope.peerserver, $rootScope.peerserverport);

    if ($rootScope['private'] === false) {
        setInterval(function() {
            if (isVisible() === true) {
                Games.update({token: $rootScope.token, players: 1}, function(data) {
                    // Do nothing
                });
            }
        }, 35000);
    }

    // Remove the server from the list
    if ($rootScope['private'] === false && isVisible() === true) {
        $scope.$on('$locationChangeStart', function() {
            Games.remove({token: $rootScope.token}, function(data) {
                // Do nothing
            });
        });
    }
})

// A controller for handling modalboxes.
.controller('modalCtrl', function($scope, ngDialog, $rootScope, Players, Games, $location) {
    // init
    if ($scope.ngDialogData !== undefined) {
        if ($scope.ngDialogData.modelname !== undefined) {
            $scope[$scope.ngDialogData.modelname] = $scope.ngDialogData.model;
        }
        if ($scope.ngDialogData.code !== undefined) {
            switch($scope.ngDialogData.code) {
                case 'join':
                    // Get the server list.
                    Games.query(function(data) {
                        $scope.servers = data;
                    });
                break;
            }
        }
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

    /**
     * Prepare the user's browser to host a game.
     */
    $scope.host = function() {
        // Set cookies
        setCookie('servername', this.server.servername, 365);
        setCookie('maxplayers', this.server.maxplayers, 365);
        setCookie('private', (this.server['private'] === true ? 1 : 0), 365);
        setCookie('peerserver', this.server.peerserver, 365);
        setCookie('peerserverport', this.server.peerport, 365);
        var token = (1 + Math.random()).toString(36).substr(2, 10);

        // Add these to the rootscope
        $rootScope.token = token;
        $rootScope['private'] = this.server['private'];
        $rootScope.maxplayers = this.server.maxplayers;
        $rootScope.peerserver = this.server.peerserver;
        $rootScope.peerserverport = this.server.peerport;
        $rootScope.isHost = true;

        if (this.server['private'] === false) {
            Games.save({token: token, name: this.server.servername, maxplayers: this.server.maxplayers, peerserver: this.server.peerserver, peerport: this.server.peerport}, function(data) {
                $location.path('/play/' + token);
            });
        } else {
            $location.path('/play/' + token);
        }

        this.close();
    };
});
