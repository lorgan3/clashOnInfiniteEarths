goog.provide('l3.objects.Player');

goog.require('l3.objects.BaseObject');
goog.require('l3.objects.StateMachine');

/**
 * A controlable object that represents a player.
 * @param {Object}                  model        The visual model of this player.
 * @param {l3.objects.StateMachine} stateMachine This player's statemachine (used to perform actions).
 * @param {Object=}                 options      An object containing all other options for this player.
 *
 * @constructor
 * @implements {l3.objects.BaseObject}
 */
l3.objects.Player = function(model, stateMachine, options) {
    /**
     * The player model.
     * @type {Object}
     */
    this.model = model;
    model.scale.set(0.3, 0.3, 0.3);

    /**
     * A statemachine that helps performing 1 action at a time.
     * @type {l3.objects.StateMachine}
     */
    this.stateMachine = stateMachine;

    /**
     * Is the player increasing his speed?
     * @type {boolean}
     */
    this.move = false;

    /**
     * Is the player attacking?
     * @type {boolean}
     */
    this.attack = false;

    /**
     * The ability that the player has currently selected.
     * @type {number}
     */
    this.ability = 1;

    /**
     * A value that determines how much the orbit changes.
     * @type {number}
     */
    this.rotation = 0;

    /**
     * The playername.
     * @type {string}
     */
    this.name = 'player';

    /**
     * The size of this object (used for collisionchecking)
     * @type {number}
     */
    this.size = 1.4;

    /**
     * The player is dead is falling towards the earth.
     * @type {boolean}
     */
    this.dead = false;

    // Set up pivots to aid with the orbit.
    this.pivot = new THREE.Object3D();
    this.pivot2 = new THREE.Object3D();
    this.pivot2.add(this.pivot);
    this.pivot.add(this.model);

    options = options || {};
    this.maxHp = options.maxHp || 100;
    this.hp = options.hp || this.maxHp;
    this.speed = 0;

    /**
     * The player stun cooldown, if it's >0 the player is stunned.
     * @type {number}
     */
    this.stunned = 0;

    /**
     * The actual position in the world of this object.
     * @type {Object}
     */
    this.worldposition = new THREE.Vector3(0, 0, 0);

    /**
     * A particle system for the smoke trail.
     * @type {l3.helpers.ParticleSystem}
     */
    this.system = particleHandler.add({ 'amount': 250, 'directions': new THREE.Vector3(0.008, 0.008, 0), 'size': 3, 'map': downloader.get('smoke') });
};

/** @inheritDoc */
l3.objects.Player.prototype.serialize = function() {
    return { 'r': this.pivot.rotation.y,
             'd': new Float32Array(this.pivot2.matrix.elements),
             's': this.speed,
             'h': this.hp
           };
};

/** @inheritDoc */
l3.objects.Player.prototype.deserialize = function(data) {
    this.pivot.rotation.y = data['r'];
    this.pivot2.matrix.elements = new Float32Array(data['d']);
    this.pivot2.rotation.setFromRotationMatrix(this.pivot2.matrix);
    this.speed = data['s'];
    this.hp = data['h'];
};

/** @inheritDoc */
l3.objects.Player.prototype.serializeQuick = function() {
    return { 'r': this.pivot.rotation.y,
             'd': new Float32Array(this.pivot2.matrix.elements)
           };
};

/** @inheritDoc */
l3.objects.Player.prototype.deserializeQuick = function(data) {
    this.pivot.rotation.y = data['r'];
    this.pivot2.matrix.elements = new Float32Array(data['d']);
    this.pivot2.rotation.setFromRotationMatrix(this.pivot2.matrix);
};

/**
 * Serializes the player input state.
 */
l3.objects.Player.prototype.serializeState = function() {
    return { 'x': this.rotation,
             'a': this.attack === true ? this.ability : 4
           };
};

/**
 * Deserializes the player input state.
 * @param {Object} data The state data.
 */
l3.objects.Player.prototype.deserializeState = function(data) {
    this.rotation = data['x'];
    this.attack = data['a'] !== 4 ? true : false;
    this.ability = data['a'];
};

/** @inheritDoc */
l3.objects.Player.prototype.update = function(delta) {
    // Update the worldposition.
    this.worldposition.setFromMatrixPosition(this.model.matrixWorld);

    // Add new particles.
    this.system.spawn(this.worldposition, this.pivot2.rotation, 0.5);

    // Move the reticle into position.
    if (this.reticle !== undefined) {
        this.reticle.position.setFromMatrixPosition(this.model.matrixWorld);
    }

    if (this.dead === false) {
        if (this.stunned > 0) {
            this.stunned -= delta;
            this.pivot.rotation.y = (this.pivot.rotation.y + 0.2*delta) % (Math.PI*2);
            this.rotateAroundObjectAxis(this.pivot2, new THREE.Vector3(0, 0, -1).applyEuler(this.pivot.rotation), (Math.floor(this.stunned*10)%4 === 0 ? 1 : -1) * delta);

            if (this.stunned <= 0) {
                this.stunned = 0;
            }
        } else {
            // Set the speed and move the player in orbit.
            this.speed = Math.max(0.25, this.speed - 1 * delta);
            this.pivot.rotation.y = (this.pivot.rotation.y + this.speed*delta) % (Math.PI*2);

            // Change orbit.
            if (this.rotation !== 0) {
                this.rotation = Math.max(-3, Math.min(3, this.rotation));
                this.rotateAroundObjectAxis(this.pivot2, new THREE.Vector3(0, 0, -1).applyEuler(this.pivot.rotation), this.rotation * delta * 0.5);
            }

            // Speed up.
            if (this.move === true) {
                this.speed = Math.min(1, this.speed + 2 * delta);
            }

            if (this.attack === true) {
                this.attack = false;
                switch(this.ability) {
                    case 0:
                        this.stateMachine.triggerState('laser');
                    break;
                    case 1:
                        this.stateMachine.triggerState('punch');
                    break;
                    case 2:
                        this.stateMachine.triggerState('speed');
                    break;
                }
            }
        }

        // Collide with asteroids
        var target = collisionHelper.hit(this.worldposition, 1, this)[0];
        if (target !== undefined && (networker.isHost === true || networker.token === undefined)) {
            if (target instanceof l3.objects.Asteroid === true) {
                this.collide(target);
            }
        }
    } else {
        this.pivot.rotation.y = (this.pivot.rotation.y - 0.4*delta) % (Math.PI*2);
        this.model.position.z -= 0.3 * delta;

        if (networker.isHost === true || networker.token === undefined) {
            if (this.model.position.z < world.orbit - 2.25) {
                networker.broadcast({ 'a': l3.main.Networking.States.PLAYER_REMOVE, 'i': players.indexOf(this) });

                var peerplayers = [];
                for (var i in networker.peers) {
                    if (networker.peers[i].peerId !== undefined) {
                        peerplayers[i] = players[networker.peers[i].peerId];
                    }
                }

                var myPlayer = players[myself];
                objectHandler.remove(this);
                myself = players.indexOf(myPlayer);
                if (myself === -1) {
                    myself = undefined;
                    cameraHelper.setUp();
                }

                // Setup peer ids properly again.
                for (var i in peerplayers) {
                    var id = players.indexOf(peerplayers[i]);
                    if (id === -1) {
                        networker.peers[i].peerId = undefined;
                    } else {
                        networker.peers[i].peerId = id;
                    }
                }
            }
        }
    }
};

/**
 * Function to rotate an object around another objects axis.
 * @param  {Object} object  The mesh that should be rotated.
 * @param  {Object} axis    The axis to rotate it around.
 * @param  {number} radians The amount of rotation that should be applied.
 */
l3.objects.Player.prototype.rotateAroundObjectAxis = function(object, axis, radians) {
    var rotObjectMatrix;
    rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);
    object.matrix.multiply(rotObjectMatrix);
    object.rotation.setFromRotationMatrix(object.matrix);
}

/** @inheritDoc */
l3.objects.Player.prototype.collide = function(other) {
    if (networker.isHost === true || networker.token === undefined) {
        var source = -1;
        if (other instanceof l3.objects.Player) {
            source = players.indexOf(other);
        }

        if (source === myself) {
            classSelect.playersKilled++;
        }
        networker.broadcast({ 'a': l3.main.Networking.States.PLAYER_DIE, 'i': players.indexOf(this), 's': source });
    }

    var snd = downloader.get('scream').play();
    if (myself !== undefined) {
        var dist = this.worldposition.distanceTo(players[myself].worldposition);
        if (dist < 20) {
            snd.volume((20-dist)/20);
        }
    }
    this.stateMachine.triggerState('getHit');
    this.dead = true;
    var system = particleHandler.add({ 'amount': 50, 'position': this.worldposition, 'directions': new THREE.Vector3(0.15, 0.15, 0.15), 'size': 3, 'map': downloader.get('particle'), 'lifetime': 60, 'color': 0xff0000 });
    system.active = false;

    if (networker.token !== undefined) {
        hud.updateTargets();
    }
};

/** @inheritDoc */
l3.objects.Player.prototype.destroy = function() {
    if (this.dead === true && (networker.isHost || networker.token === undefined)) {
        // Lose on singleplayer
        if (players.length <= 1 && networker.token === undefined) {
            classSelect.won = false;
        }

        window.setTimeout(function() {
            if (classSelect.won !== undefined) {
                showClassSelect()
            }
        }, 2000);
    }

    scene.remove(this.pivot2);
    if (this.reticle !== undefined) {
        scene2.remove(this.reticle);
    }

    this.system.cloud.emit = 4;
    this.system.fade(true);

    delete this.model;
    delete this.stateMachine;
};

/**
 * Stuns the player
 */
l3.objects.Player.prototype.stun = function() {
    if (networker.isHost === true) {
        networker.broadcast({ 'a': l3.main.Networking.States.PLAYER_STUN, 'i': players.indexOf(this) });
    }
    var snd = downloader.get('stun').play();
    if (myself !== undefined) {
        var dist = this.worldposition.distanceTo(players[myself].worldposition);
        if (dist < 20) {
            snd.volume((20-dist)/20);
        }
    }
    var system = particleHandler.add({ 'amount': 50, 'position': this.worldposition, 'directions': new THREE.Vector3(0.15, 0.15, 0.15), 'size': 3, 'map': downloader.get('particle'), 'lifetime': 60, 'color': 0xff0000 });
    system.active = false;
    this.stunned = 3;
};
