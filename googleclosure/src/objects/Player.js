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
    model.scale.set(0.51, 0.51, 0.51);
    this.stateMachine = stateMachine;

    //this.attack = false;
    this.move = false;
    this.mouseX = 0;

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
    return { /*'x': this.pivot2.rotation.x / Math.PI * 16000,
             'y': this.pivot2.rotation.y / Math.PI * 16000,
             'z': this.pivot2.rotation.z / Math.PI * 16000,
             'a': this.pivot.rotation.x / Math.PI * 16000,
             'b': this.pivot.rotation.z / Math.PI * 16000,*/
             'd': new Float32Array(this.pivot2.matrix.elements),
             's': this.speed,
             'h': this.hp
           };
};

/**
 * A function that deserializes the data from the serialize method.
 * @param  {Object} data A json object containing all values that should be synced.
 */
l3.objects.Player.prototype.deserialize = function(data) {
    //console.log(new Uint32Array(data['d']));
    /*this.pivot2.rotation.x = Math.floor(data['x'] * Math.PI / 16000);
    this.pivot2.rotation.y = Math.floor(data['z'] * Math.PI / 16000);
    this.pivot2.rotation.z = Math.floor(data['y'] * Math.PI / 16000);
    this.pivot.rotation.x = Math.floor(data['a'] * Math.PI / 16000);
    this.pivot.rotation.z = Math.floor(data['b'] * Math.PI / 16000);*/
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
             'x': this.mouseX,
             'r': Math.floor(this.pivot.rotation.y / Math.PI * 16000)
           };
};

/**
 * Deserializes the player input state.
 * @param {Object} data The state data.
 */
l3.objects.Player.prototype.deserializeState = function(data) {
    this.move = data['m'];
    this.mouseX = data['x'];
    this.pivot.rotation.y = data['r'] * Math.PI / 16000;
};

/**
 * Function that updates the enity.
 * @param  {number} delta The time in ms since the last update.
 */
l3.objects.Player.prototype.update = function(delta) {
    this.speed = Math.max(0.5, this.speed - 1 * delta);
    this.pivot.rotation.y += this.speed*delta;
    if (this.pivot.rotation.y > Math.PI*2) {
        this.pivot.rotation.y -= Math.PI*2;
    } else if (this.pivot.rotation.y < 0) {
        this.pivot.rotation.y += Math.PI*2;
    }

    // Change orbit.
    if (this.mouseX !== 0) {
        var sign = (typeof this.mouseX === 'number' ? this.mouseX ? this.mouseX < 0 ? -4 : 4 : this.mouseX === this.mouseX ? 0 : NaN : NaN);
        this.rotateAroundObjectAxis(this.pivot2, new THREE.Vector3(0, 0, -1).applyEuler(this.pivot.rotation), sign * delta);
    }

    // Speed up.
    if (this.move === true) {
        this.speed = Math.min(1.6, this.speed + 2 * delta);
    }

    /*if (this.attack === true) {
        this.rotateAroundObjectAxis(this.pivot2, new THREE.Vector3(0, 0, 1).applyEuler(this.pivot.rotation), -0.02 * delta);
    }*/
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
