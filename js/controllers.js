var app = angular.module('l3game')

.controller('homeCtrl', function($scope) {
})

.controller('scoresCtrl', function($scope) {
})

.controller('wikiCtrl', function($scope) {
})

.controller('gameCtrl', function($scope, $rootScope, Games, $routeParams, ngDialog) {
    /**
     * Start the game.
     */
    $scope.launch = function() {
        startGame($rootScope.isHost || false, $rootScope.token, $rootScope.maxplayers || 4, $rootScope.peerserver, $rootScope.peerserverport, $rootScope.servername, $rootScope.user === undefined ? 'Player' : $rootScope.user.name);

        // Keep the server in the list.
        if ($rootScope['private'] === false) {
            setInterval(function() {
                if (isVisible() === true) {
                    Games.update({token: $rootScope.token, players: getPlayers()}, function(data) {
                        // Do nothing
                    });
                }
            }, 10000);
        }

        // Remove the server from the list
        $scope.$on('$locationChangeStart', function() {
            if ($rootScope['private'] === false && isVisible() === true) {
                Games.remove({token: $rootScope.token}, function(data) {
                    // Do nothing
                });
            }

            // Force a page reload here to clear the game.
            location.reload();
        });

        // Listen for escape keypresses to open the menu modal.
        document.addEventListener('keydown', function(e) {
            if (e.keyCode === 27 && document.getElementsByClassName('ngdialog').length === 0) {
                $scope.showMenu();
            }
        });
    };

     /**
     * Opens the ingame menu dialog.
     */
    $scope.showMenu = function() {
        ngDialog.open({
            template: 'partials/modals/menu.html',
            controller: 'modalCtrl',
            scope: $scope
        });
    };

    $scope.showScore = function() {
        showClassSelect();
        this.close();
    }

    //The game was opened via a link, check the peerserver settings before continuing.
    if ($routeParams.key !== undefined && $rootScope.token === undefined) {
        $rootScope.token = $routeParams.key;
        ngDialog.open({
            template: 'partials/modals/peerserver.html',
            controller: 'modalCtrl',
            data: {modelname: 'server', model: {
                peerserver: getCookie('peerserver'),
                peerport: Number(getCookie('peerserverport')) || 9000}
            },
            scope: $scope
        });

        /**
         * Set the peerservers and go.
         */
        $scope.validatePeer = function() {
            // Set cookies
            setCookie('peerserver', this.server.peerserver, 365);
            setCookie('peerserverport', this.server.peerport, 365);
            $rootScope.peerserver = this.server.peerserver;
            $rootScope.peerserverport = this.server.peerport;
            $rootScope.serverName = $rootScope.token;
            $scope.launch();
            this.close();
        };

        /**
         * Just go without setting peerservers.
         */
        $scope.skipPeer = function() {
            $scope.launch();
            this.close();
        }
    } else {
        $scope.launch();
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
        $rootScope.servername = this.server.servername;

        if (this.server['private'] === false) {
            Games.save({token: token, name: this.server.servername, maxplayers: this.server.maxplayers, peerserver: this.server.peerserver, peerport: this.server.peerport}, function(data) {
                $location.path('/play/' + token);
            });
        } else {
            $location.path('/play/' + token);
        }

        this.close();
    };

    /**
     * Joins a server
     * @param  {Object} server The server to join.
     */
    $scope.join = function(server) {
        $rootScope.token = server.key;
        $rootScope.peerserver = server.peerServer;
        $rootScope.peerserverport = server.peerPort;
        $rootScope.isHost = false;
        $rootScope.servername = server.servername;

        $location.path('/play/' + server.key);

        this.close();
    };
});
