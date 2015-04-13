goog.provide('l3.objects.Player');

goog.require('l3.objects.Entity');
goog.require('l3.objects.StateMachine');

/**
 * A controlable object that represents a player
 * @param {Object}                  model        The visual model of this player.
 * @param {l3.objects.StateMachine} stateMachine This player's statemachine (used to perform actions).
 * @param {Object=}                 options      An object containing all other options for this player.
 *
 * @constructor
 * @implements {l3.objects.Entity}
 */
l3.objects.Player = function(model, stateMachine, options) {
    this.model = model;
    model.scale.set(0.5, 0.5, 0.5);
    this.stateMachine = stateMachine;

    this.attack = false;
    this.move = false;
    this.scroll = 0;
    this.rotation = 0;

    this.name = 'player';

    // Set up pivots to aid with the orbit.
    this.pivot = new THREE.Object3D();
    this.pivot2 = new THREE.Object3D();
    this.pivot2.add(this.pivot);
    this.pivot.add(this.model);

    options = options || {};
    this.maxHp = options.maxHp || 100;
    this.hp = options.hp || this.maxHp;
    this.speed = 0;
};

/**
 * A function that returns a json object with all values that should be synced.
 * @return {Object} A json object containing all values that should be synced.
 */
l3.objects.Player.prototype.serialize = function() {
    return {'x': this.model.position.x, 'y': this.model.position.z, 'r': this.rotation, 'h': this.hp};
};

/**
 * A function that deserializes the data from the serialize method.
 * @param  {Object} data A json object containing all values that should be synced.
 */
l3.objects.Player.prototype.deserialize = function(data) {
    this.model.position.x = data['x'];
    this.model.position.z = data['y'];
    this.rotation = data['r'];
    this.hp = data['h'];
};

/**
 * Serializes the player input state.
 */
l3.objects.Player.prototype.serializeState = function() {
    return {'a': this.attack, 'm': this.move, 'r': this.rotation};
};

/**
 * Deserializes the player input state.
 * @param {Object} data The state data.
 */
l3.objects.Player.prototype.deserializeState = function(data) {
    this.attack = data['a'];
    this.move = data['m'];
    this.rotation = data['r'];
};

/**
 * Function that updates the enity.
 * @param  {number} delta The time in ms since the last update.
 */
l3.objects.Player.prototype.update = function(delta) {
    this.speed = Math.max(0, this.speed-0.4*delta);
    this.pivot.rotation.y += /*this.speed*delta;*/ 0.01;

    if (this.move === true) {
        this.rotateAroundObjectAxis(this.pivot2, new THREE.Vector3(0, 0, 1).applyEuler(this.pivot.rotation), 0.01);
    }

    if (this.attack === true) {
        this.rotateAroundObjectAxis(this.pivot2, new THREE.Vector3(0, 0, 1).applyEuler(this.pivot.rotation), -0.01);
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

/**
 * Function that destroys the entity.
 */
l3.objects.Player.prototype.destroy = function() {
    scene.remove(this.model);
    delete this.model;
    delete this.stateMachine;
};
