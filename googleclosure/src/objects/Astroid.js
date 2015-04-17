goog.provide('l3.objects.Astroid');

goog.require('l3.objects.BaseObject');

/**
 * An astroid.
 * @param {Object}  model   The visual model of this astroid.
 * @param {Object=} options An object containing all other options for this astroid.
 *
 * @constructor
 * @implements {l3.objects.BaseObject}
 */
l3.objects.Astroid = function(model, options) {
    /**
     * The model.
     * @type {Object}
     */
    this.model = model;

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

    this.hitCooldown = 0;

    /**
     * The actual position in the world of this object.
     * @type {Object}
     */
    this.worldposition = new THREE.Vector3(0, 0, 0);

    /**
     * A particle system for the smoke trail.
     * @type {l3.helpers.ParticleSystem}
     */
    this.system = particleHandler.add({ 'amount': 60,  'directions': new THREE.Vector3(0.04, 0.04, 0), 'size': 4, 'map': downloader.get('particle'), 'color': 0xff0000 });
};

/** @inheritDoc */
l3.objects.Astroid.prototype.serialize = function() {
    return { 'r': this.pivot.rotation.y,
             'd': new Float32Array(this.pivot2.matrix.elements)
           };
};

/** @inheritDoc */
l3.objects.Astroid.prototype.deserialize = function(data) {
    this.pivot.rotation.y = data['r'];
    this.pivot2.matrix.elements = new Float32Array(data['d']);
    this.pivot2.rotation.setFromRotationMatrix(this.pivot2.matrix);
};

/**
 * Function that updates the enity.
 * @param  {number} delta The time in ms since the last update.
 */
l3.objects.Astroid.prototype.update = function(delta) {
    // Update the worldposition.
    this.worldposition.setFromMatrixPosition(this.model.matrixWorld);

    // Add new particles.
    this.system.spawn(this.worldposition, this.pivot2.rotation, 0.5);

    // Move the astroid.
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
l3.objects.Astroid.prototype.rotateAroundObjectAxis = function(object, axis, radians) {
    var rotObjectMatrix;
    rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);
    object.matrix.multiply(rotObjectMatrix);
    object.rotation.setFromRotationMatrix(object.matrix);
};

/** @inheritDoc */
l3.objects.Astroid.prototype.collide = function(other) {
    if (this.hitCooldown === 0) {
        this.hitCooldown = 0.6;
        var angle = this.worldposition.angleTo(other.worldposition);
        this.rotateAroundObjectAxis(this.pivot2, new THREE.Vector3(0, 0, -1).applyEuler(this.pivot.rotation), angle * 100);
    }
};

/** @inheritDoc */
l3.objects.Astroid.prototype.destroy = function() {
    scene.remove(this.pivot2);
    delete this.model;
};
