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

    this.maxplayers = maxplayers || 4;
    if (peerserver !== undefined && String(peerserver).trim() !== '') {
        var options = {'debug': 0, 'host': peerserver, 'port': peerserverport, 'path': '/'}
    } else {
        var options = {'key': 'lsu2wx71j874lsor', 'debug': 0}
    }

    if (isHost) {
        this.peer = new Peer(token, options);

        var self = this;
        this.peer.on('connection', function(other) {
            other.on('open', function() {
                self.broadcast({'a': l3.main.Networking.States.PLAYER_JOIN, 'n': 'playerX', 'c': 1});
                self.addListeners(other);
                self.peers.push(other);
                other.peerId = self.peers.length;

                var player = l3.init.PlayerFactory.Wizard(new THREE.Vector3(0, 0, 25));
                objectHandler.add(player);
                this.sendFullUpdate(other);
                console.log('opened');
            });
        });
    } else if (token !== undefined) {
        this.peer = new Peer(options);
        this.connection = this.peer.connect(token);
        this.addListeners(this.connection);

        this.peer.on('error', function(error) {
            switch(error.type) {
                case 'browser-incompatible':
                    alert('Please use a newer browser (not internet explorer)');
                    break;
                case 'peer-unavailable':
                    alert('No one is hosting!');
                    break;
                default:
                    alert(error.message);
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
    PLAYER_JOIN: 4,
    PLAYER_LEAVE: 5,
    OBJECT_DEATH: 6
};

/**
 * Adds the eventlisteners to the connection.
 * @param {Object} connection The connection.
 */
l3.main.Networking.prototype.addListeners = function(connection) {
    var self = this;

    connection.on('close', function() {
        if (self.isHost === true) {
            console.log('closed');
            var index = self.peers.indexOf(connection);
            self.peers.slice(index, 1);
            connection.close();

            var player = players[index+1];
            objectHandler.remove(player);
            player.destroy();

            self.broadcast({'a': l3.main.Networking.States.PLAYER_LEAVE, 'i': index+1});
            var j = 1;
            for(var i in self.peers) {
                self.peers[i].peerId = j;
                j++;
            }
        }
    });

    connection.on('disconnected', function() {
        connection.reconnect();
    });

    connection.on('data', function(data) {
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
                    myself = data['i'];
                    players[myself].model.add(camera);
                break;
                case l3.main.Networking.States.PLAYER_JOIN:
                    var player = l3.init.PlayerFactory.Wizard(new THREE.Vector3(0, 0, 25));
                    player.name = data['n'];

                    objectHandler.add(player);
                break;
                case l3.main.Networking.States.PLAYER_LEAVE:
                    var player = players[data['i']];
                    var myPlayer = players[myself];
                    objectHandler.remove(player);
                    player.destroy();
                    myself = players.indexOf(myPlayer);
                break;
                case l3.main.Networking.States.OBJECT_DEATH:
                    this.removeEnemy(data['i']);
                break;
            }
        }
    });
};

/**
 * Kills an enemy and removes it.
 * @param  {number} index The index of the object that should die.
 */
l3.main.Networking.prototype.removeEnemy = function(index) {
    var object = enemies[index];
    objectHandler.remove(object);

    enemies.splice(index, 1);

    object.model.animations[1].play();
    animationListener.onEnd(object.model.animations[1], function(e) {
        object.destroy();
    });
};

/**
 * Sends the complete gamestate to the peer.
 * @param {Object} peer The peer to send the update to.
 */
l3.main.Networking.prototype.sendFullUpdate = function(peer) {
    var data = [];
    for(var i in players) {
        data.push(players[i].serialize());
    }
    for(var i in enemies) {
        data.push(enemies[i].serialize());
    }

    peer.send({'a': l3.main.Networking.States.FULL, 'p': players.length, 'b': enemies.length, 'd': data, 'i': peer.peerId});
};

/**
 * Receives a fullupdate and parses it.
 * @param  {Object} data The fullupdate data.
 */
l3.main.Networking.prototype.receiveFullUpdate = function(data) {
    for(var i=0; i<data['p']; i++) {
        var player = l3.init.PlayerFactory.Wizard(new THREE.Vector3(0, 0, 25));
        objectHandler.add(player);
    }

    var j = 0;
    for(var i in players) {
        if (j !== myself) {
            players[i].deserialize(data['d'][j]);
        }
        j++;
    }
    for(var i in enemies) {
        enemies[i].deserialize(data['d'][j]);
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
    for(var i in players) {
        data.push(players[i].serialize());
    }
    for(var i in enemies) {
        data.push(enemies[i].serialize());
    }

    this.broadcast({'a': l3.main.Networking.States.QUICK, 'd': data});
};

/**
 * Receives a fullupdate and parses it.
 * @param  {Object} data The fullupdate data.
 */
l3.main.Networking.prototype.receiveQuickUpdate = function(data) {
    var j = 0;
    for(var i in players) {
        //if (i !== myself) {
            players[i].deserialize(data[j]);
        //}
        j++;
    }
    for(var i in enemies) {
        enemies[i].deserialize(data[j]);
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
            //if (+i !== myself) {
                players[i].deserializeState(data[i]);
            //}
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