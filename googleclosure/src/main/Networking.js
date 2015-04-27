goog.provide('l3.main.Networking');

/**
 * Handler for networking.
 *
 * @param  {boolean}  isHost         Are you the host?
 * @param  {string=}  token          The peer token.
 * @param  {number=}  maxplayers     The maximum amount of players.
 * @param  {string=}  peerserver     The peerserver hostname.
 * @param  {number=}  peerserverport The peerserver port.
 * @constructor
 */
l3.main.Networking = function(isHost, token, maxplayers, peerserver, peerserverport) {
    this.connection = undefined;
    this.isHost = isHost;
    this.peer = undefined;
    this.peers = [];
    this.token = token;
    this.connected = false;

    this.maxplayers = maxplayers || 4;
    if (peerserver !== undefined && String(peerserver).trim() !== '') {
        var options = {'debug': 0, 'host': peerserver, 'port': peerserverport, 'path': '/'}
    } else {
        var options = {'key': 'lsu2wx71j874lsor', 'debug': 0}
    }

    if (isHost === true) {
        var self = this;
        this.peer = new Peer(token, options);

        this.peer.on('connection', function(other) {
            other.on('open', function() {
                self.addListeners(other);
                self.peers.push(other);
                other.peerId = self.peers.length;
                this.sendFullUpdate(other);
            });
        });
    } else if (token !== undefined) {
        panel.set(l3.html.Panel.types.INFO, 'Connecting', 'Connecting to the server...', 0);
        this.peer = new Peer(options);
        this.connection = this.peer.connect(token);
        this.addListeners(this.connection);

        this.peer.on('error', function(error) {
            switch(error.type) {
                case 'browser-incompatible':
                    panel.set(l3.html.Panel.types.DANGER, 'Incompatible browser!', 'Please use a newer browser (not internet explorer).', undefined, true);
                break;
                case 'peer-unavailable':
                     panel.set(l3.html.Panel.types.DANGER, 'Peer unavailable!', 'Can\'t connect to the selected server.', undefined, true);
                break;
                default:
                    panel.set(l3.html.Panel.types.DANGER, error.type, error.message, undefined, true);
                break;
            }
        });
    }
};

/**
 * Sync states.
 * @enum {number}
 */
l3.main.Networking.States = {
    FULL: 1,
    STATE: 2,
    QUICK: 3,
    PLAYER_SPAWN: 4,
    PLAYER_DIE: 5,
    RESET: 6
};

/**
 * Adds the eventlisteners to the connection.
 * @param {Object} connection The connection.
 */
l3.main.Networking.prototype.addListeners = function(connection) {
    var self = this;

    connection.on('close', function() {
        if (self.isHost === true) {
            var index = self.peers.indexOf(connection);
            self.peers.splice(index, 1);
            connection.close();

            var player = players[index+1];
            objectHandler.remove(player);

            self.broadcast({'a': l3.main.Networking.States.PLAYER_DIE, 'i': index+1});
            var j = 1;
            for(var i in self.peers) {
                self.peers[i].peerId = j;
                j++;
            }
        } else {
            panel.set(l3.html.Panel.types.DANGER, 'Disconnected!', 'Lost connection to the server.', undefined, true);
        }
    });

    connection.on('disconnected', function() {
        connection.reconnect();
    });

    connection.on('data', function(data) {
        if (self.connected === false) {
            self.connected = true;
            panel.hide();
        }

        if (self.isHost === true) {
            switch(data['a']) {
                case l3.main.Networking.States.STATE:
                    self.deserializeState(data['d'], connection.peerId);
                break;
            }
        } else {
            switch(data['a']) {
                case l3.main.Networking.States.STATE:
                    self.deserializeState(data['d']);
                break;
                case l3.main.Networking.States.QUICK:
                    self.receiveQuickUpdate(data['d']);
                break;
                case l3.main.Networking.States.FULL:
                    this.receiveFullUpdate(data);

                    if (players.length > data['i']) {
                        myself = data['i'];
                        cameraHelper.setUp();
                    }
                break;
                case l3.main.Networking.States.PLAYER_SPAWN:
                    var player = l3.init.PlayerFactory.Wizard(new THREE.Vector3(0, 0, world.orbit-1.5));
                break;
                case l3.main.Networking.States.PLAYER_DIE:
                    var player = players[data['i']];
                    var myPlayer = players[myself];
                    objectHandler.remove(player);
                    myself = players.indexOf(myPlayer);
                break;
                case l3.main.Networking.States.RESET:
                    gameEnd();
                break;
            }
        }
    });
};

/**
 * Sends the complete gamestate to the peer.
 * @param {Object} peer The peer to send the update to.
 */
l3.main.Networking.prototype.sendFullUpdate = function(peer) {
    var data = [];
    for (var i in players) {
        data.push(players[i].serialize());
    }
    for (var i in astroids) {
        data.push(astroids[i].serialize());
    }

    peer.send({'a': l3.main.Networking.States.FULL, 'p': players.length, 'b': astroids.length, 'd': data, 'i': peer.peerId});
};

/**
 * Receives a fullupdate and parses it.
 * @param  {Object} data The fullupdate data.
 */
l3.main.Networking.prototype.receiveFullUpdate = function(data) {
    for (var i=0; i<data['p']; i++) {
        l3.init.PlayerFactory.Wizard(new THREE.Vector3(0, 0, world.orbit-1.5));
    }

    for (var i=0; i<data['b']; i++) {
        l3.init.PlayerFactory.Astroid(new THREE.Vector3(0, 0, world.orbit));
    }

    var j = 0;
    for (var i in players) {
        players[i].deserialize(data['d'][j]);
        j++;
    }
    for (var i in astroids) {
        astroids[i].deserialize(data['d'][j]);
        j++;
    }
};

/**
 * Sends the complete gamestate to all players.
 */
l3.main.Networking.prototype.sendQuickUpdate = function() {
    if (this.peer === undefined) {
        return;
    }

    var data = [];
    for (var i in players) {
        data.push(players[i].serialize());
    }
    for (var i in astroids) {
        data.push(astroids[i].serialize());
    }

    this.broadcast({'a': l3.main.Networking.States.QUICK, 'd': data});
};

/**
 * Receives a fullupdate and parses it.
 * @param  {Object} data The fullupdate data.
 */
l3.main.Networking.prototype.receiveQuickUpdate = function(data) {
    var j = 0;
    for (var i in players) {
        players[i].deserialize(data[j]);
        j++;
    }
    for (var i in astroids) {
        astroids[i].deserialize(data[j]);
        j++;
    }
};

/**
 * Serializes the state of all players/yourself.
 */
l3.main.Networking.prototype.serializeState = function() {
    if (this.peer === undefined) {
        return;
    }
    var data = [];

    if (this.isHost === true) {
        for(var i in players) {
            data.push(players[i].serializeState());
        }

        this.broadcast({'a': l3.main.Networking.States.STATE, 'd': data});
    } else if (myself !== undefined) {
        this.connection.send({'a': l3.main.Networking.States.STATE, 'd': players[myself].serializeState()});
    }
};

/**
 * Deserializes the received player data.
 * @param {Object}  data The player data.
 * @param {number=} id   The id of the peer.
 */
l3.main.Networking.prototype.deserializeState = function(data, id) {
    if (this.isHost === false) {
        for(var i in players) {
            if (+i !== myself) {
                players[i].deserializeState(data[i]);
            }
        }
    } else {
        players[id].deserializeState(data);
    }
};

/**
 * Broadcasts the data to all peers
 * @param  {Object} data The data to be broadcasted.
 */
l3.main.Networking.prototype.broadcast = function(data) {
    for(var i in this.peers) {
        this.peers[i].send(data);
    }
};

/**
 * Is this server visble.
 */
l3.main.Networking.prototype.isVisible = function() {
    return true;
};

// Export this function so this property can be checked in Angular.
window['isVisible'] = l3.main.Networking.prototype.isVisible;

/**
 * Get the amount of players in the server.
 * @return {number} The amount of players in the server.
 */
l3.main.Networking.prototype.getPlayers = function() {
    return players.length;
};

// Export this function so this property can be checked in Angular.
window['getPlayers'] = l3.main.Networking.prototype.getPlayers;