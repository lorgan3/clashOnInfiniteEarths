goog.provide('l3.objects.Laser');

goog.require('l3.objects.BaseObject');

/**
 * A laserbeam.
 *
 * @param {Object}   model  The visual model of this laser.
 * @param {Object=} options An object containing all other options for this asteroid.
 *
 * @constructor
 * @implements {l3.objects.BaseObject}
 */
l3.objects.Laser = function(model, options) {
    /**
     * The laser model.
     * @type {Object}
     */
    this.model = model;
    model.scale.set(0.3, 0.3, 0.3);

    /**
     * The owner of this laserbeam.
     * @type {l3.objects.BaseObject}
     */
    this.owner = null;

    /**
     * The size of this object (used for collisionchecking)
     * @type {number}
     */
    this.size = 0;

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

    var trail = new THREE.Line(new THREE.CircleGeometry(world.orbit-1.5, 10, Math.PI/2, Math.PI/8), new THREE.LineBasicMaterial({ color: 0xff0000 }));
    trail.geometry.vertices.shift(); // Remove the center vertex
    trail.rotation.x = Math.PI/2;
    this.pivot.add(trail);

    options = options || {};
    /**
     * Life time in seconds.
     * @type {number}
     */
    this.lifetime = options.lifetime || 5;

    /**
     * Lifetime counter.
     * @type {number}
     */
    this.timeAlive = 0;

    /**
     * A particle system for the trail.
     * @type {l3.helpers.ParticleSystem}
     */
    this.system = particleHandler.add({ 'amount': 30, 'directions': new THREE.Vector3(0.05, 0.05, 0.05), 'size': 1, 'color': 0xff0000, 'blending': THREE.NormalBlending });
};

/** @inheritDoc */
l3.objects.Laser.prototype.serialize = function() {
    return {};
};

/** @inheritDoc */
l3.objects.Laser.prototype.deserialize = function(data) {
};

/**
 * Function that updates the enity.
 * @param  {number} delta The time in ms since the last update.
 */
l3.objects.Laser.prototype.update = function(delta) {
    // Update the worldposition.
    this.worldposition.setFromMatrixPosition(this.model.matrixWorld);

    // Add new particles.
    this.system.spawn(this.worldposition, this.pivot2.rotation, 0.1);

    // Move the laser.
    this.pivot.rotation.y = (this.pivot.rotation.y + 1*delta) % (Math.PI*2);

    var target = collisionHelper.hit(this.worldposition, 1, this)[0];
    this.collide(target);

    this.timeAlive += delta;
    if (this.timeAlive > this.lifetime) {
        objectHandler.remove(this);
    }
};

/**
 * Function to rotate an object around another objects axis.
 * @param  {Object} object  The mesh that should be rotated.
 * @param  {Object} axis    The axis to rotate it around.
 * @param  {number} radians The amount of rotation that should be applied.
 */
l3.objects.Laser.prototype.rotateAroundObjectAxis = function(object, axis, radians) {
    var rotObjectMatrix;
    rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);
    object.matrix.multiply(rotObjectMatrix);
    object.rotation.setFromRotationMatrix(object.matrix);
};

/** @inheritDoc */
l3.objects.Laser.prototype.collide = function(other) {
    if (other instanceof l3.objects.Player && other !== this.owner) {
        objectHandler.remove(this);
        objectHandler.remove(other);
        particleHandler.add({ 'amount': 1, 'directions': new THREE.Vector3(0, 0, 0), 'size': 50, 'map': downloader.get('pow'), 'lifetime': 60, 'blending': THREE.NormalBlending }).spawn(other.worldposition);
    } else if (other instanceof l3.objects.Asteroid) {
        downloader.get('crush').play();
        var system = particleHandler.add({ 'amount': 150, 'position': other.worldposition, 'directions': new THREE.Vector3(0.15, 0.15, 0.15), 'size': 3 * other.size, 'map': downloader.get('particle'), 'lifetime': 60 });
        system.active = false;

        // Camera shake effect
        if (myself !== undefined) {
            var dist = players[myself].worldposition.distanceTo(other.worldposition);
            if (dist <= 10) {
                cameraHelper.shake(0.4, (11-dist)*15);
            }
        }

        // Spawn more asteroids.
        if (other.size > 0.5)
        for (var i=0; i<2; i++) {
            var asteroid = l3.init.PlayerFactory.Asteroid(new THREE.Vector3(0, 0, other.model.position.z - 0.5), other.model.scale.x / 2, 'asteroid2');
            asteroid.size = other.size / 2;
            asteroid.pivot2.matrix.copy(other.pivot2.matrix);
            asteroid.pivot2.rotation.setFromRotationMatrix(asteroid.pivot2.matrix);
            asteroid.pivot.rotation.y = other.pivot.rotation.y;
            asteroid.rotateAroundObjectAxis(asteroid.pivot2, new THREE.Vector3(0, 0, -1).applyEuler(asteroid.pivot.rotation), (Math.PI/2 + i*Math.PI));
        }

        objectHandler.remove(this);
        objectHandler.remove(other);
    }
};

/** @inheritDoc */
l3.objects.Laser.prototype.destroy = function() {
    scene.remove(this.pivot2);
    this.system.remove();
    delete this.model;
};
