goog.provide('l3.main.Networking');

/**
 * Handler for networking.
 * @constructor
 */
l3.main.Networking = function() {
    this.connection = undefined;
    this.isHost = false;
    this.peer = undefined;
    this.peers = [];
    //var options = {'debug': 0, 'host': '192.168.1.62', 'port': 8080, 'path': '/'}
    var options = {'key': 'lsu2wx71j874lsor', 'debug': 0}

    if (confirm('Are you the host?') === true) {
        this.isHost = true;
        this.peer = new Peer('game', options);

        var self = this;
        this.peer.on('connection', function(other) {
            other.on('open', function() {
                self.broadcast({'a': l3.main.Networking.States.PLAYER_JOIN, 'n': 'playerX', 'c': 1});
                self.addListeners(other);
                self.peers.push(other);
                other.peerId = self.peers.length;

                var player = l3.init.PlayerFactory.Wizard();
                players.push(player);
                objectHandler.add(player);

                this.sendFullUpdate(other);
                console.log('opened');
            });
        });
    } else {
        this.peer = new Peer(options);
        this.connection = this.peer.connect('game');
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
                    cameraHelper.setUp();
                break;
                case l3.main.Networking.States.PLAYER_JOIN:
                    var player = l3.init.PlayerFactory.Wizard();
                    player.name = data['n'];
                    player.color = colors[data['c']];

                    players.push(player);
                    objectHandler.add(player);
                break;
                case l3.main.Networking.States.PLAYER_LEAVE:
                    var player = players[data['i']];
                    objectHandler.remove(player);
                    player.destroy();

                    var myPlayer = players[myself];
                    players.slice(data['i'], 1);
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

    enemies.slice(index, 1);

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
        var player = l3.init.PlayerFactory.Wizard();
        players.push(player);
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
        if (j !== myself) {
            players[i].deserialize(data[j]);
        }
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
    var data = [];

    if (this.isHost) {
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
    if (!this.isHost) {
        for(var i in players) {
            if (i !== '1') { // TODO get from server
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