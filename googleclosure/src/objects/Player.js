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
    this.size = 2;

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

/**
 * Serializes the player input state.
 */
l3.objects.Player.prototype.serializeState = function() {
    return { 'm': this.move,
             'x': this.rotation
           };
};

/**
 * Deserializes the player input state.
 * @param {Object} data The state data.
 */
l3.objects.Player.prototype.deserializeState = function(data) {
    this.move = data['m'];
    this.rotation = data['x'];
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
        this.stateMachine.triggerState('punch');
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
    console.log('hit!');
};

/** @inheritDoc */
l3.objects.Player.prototype.destroy = function() {
    scene.remove(this.pivot2);
    if (this.reticle !== undefined) {
        scene2.remove(this.reticle);
    }
    this.system.remove();

    delete this.model;
    delete this.stateMachine;
};
