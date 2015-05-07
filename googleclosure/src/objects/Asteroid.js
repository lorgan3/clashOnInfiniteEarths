goog.provide('l3.objects.Asteroid');

goog.require('l3.objects.BaseObject');

/**
 * An asteroid.
 * @param {Object}  model   The visual model of this asteroid.
 * @param {Object=} options An object containing all other options for this asteroid.
 *
 * @constructor
 * @implements {l3.objects.BaseObject}
 */
l3.objects.Asteroid = function(model, options) {
    options = options || {};

    /**
     * The model.
     * @type {Object}
     */
    this.model = model;

    /**
     * The size of this object (used for collisionchecking)
     * @type {number}
     */
    this.size = options.size || 2;

    // Set up pivots to aid with the orbit.
    this.pivot = new THREE.Object3D();
    this.pivot2 = new THREE.Object3D();
    this.pivot2.add(this.pivot);
    this.pivot.add(this.model);

    /**
     * The actual position in the world of this object.
     * @type {Object}
     */
    this.worldposition = new THREE.Vector3(0, 0, 0);
};

/** @inheritDoc */
l3.objects.Asteroid.prototype.serialize = function() {
    return { 'r': this.pivot.rotation.y,
             'd': new Float32Array(this.pivot2.matrix.elements)
           };
};

/** @inheritDoc */
l3.objects.Asteroid.prototype.deserialize = function(data) {
    this.pivot.rotation.y = data['r'];
    this.pivot2.matrix.elements = new Float32Array(data['d']);
    this.pivot2.rotation.setFromRotationMatrix(this.pivot2.matrix);
};

/**
 * Function that updates the enity.
 * @param  {number} delta The time in ms since the last update.
 */
l3.objects.Asteroid.prototype.update = function(delta) {
    // Update the worldposition.
    this.worldposition.setFromMatrixPosition(this.model.matrixWorld);

    // Move the asteroid.
    this.pivot.rotation.y = (this.pivot.rotation.y + 0.25*delta) % (Math.PI*2);

    this.model.rotation.z = (this.model.rotation.y + 3 * delta) % (Math.PI*2);

    this.hitCooldown = Math.max(0, this.hitCooldown - delta);
};

/**
 * Function to rotate an object around another objects axis.
 * @param  {Object} object  The mesh that should be rotated.
 * @param  {Object} axis    The axis to rotate it around.
 * @param  {number} radians The amount of rotation that should be applied.
 */
l3.objects.Asteroid.prototype.rotateAroundObjectAxis = function(object, axis, radians) {
    var rotObjectMatrix;
    rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);
    object.matrix.multiply(rotObjectMatrix);
    object.rotation.setFromRotationMatrix(object.matrix);
};

/** @inheritDoc */
l3.objects.Asteroid.prototype.collide = function(other) {
    if (this.hitCooldown === 0) {
        this.hitCooldown = 0.6;
        var i, j = 0, min = this.worldposition.x - other.worldposition.x;
        if (this.worldposition.y - other.worldposition.y < min) {
            min = this.worldposition.y - other.worldposition.y;
            j = 1;
        }
        if (this.worldposition.z - other.worldposition.z < min) {
            min = this.worldposition.z - other.worldposition.z;
            j = 2;
        }
        var pos1 = new THREE.Vector3().copy(this.worldposition), pos2 = new THREE.Vector3().copy(other.worldposition);
        pos1.setComponent(j, 0);
        pos1.normalize();
        pos2.setComponent(j, 0);
        pos2.normalize();
        var angle = pos1.angleTo(pos2);
        console.log(angle);
        console.log(pos1);
        console.log(pos2);
        this.rotateAroundObjectAxis(this.pivot2, new THREE.Vector3(0, 0, -1).applyEuler(this.pivot.rotation), angle * 100);
    }
};

/** @inheritDoc */
l3.objects.Asteroid.prototype.destroy = function() {
    scene.remove(this.pivot2);
    delete this.model;
};
