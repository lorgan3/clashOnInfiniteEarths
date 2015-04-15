goog.provide('l3.helpers.ParticleSystem');

/**
 * Creates a particle system.
 * @param {Object} options An object with options, check description below.
 * @constructor
 */
l3.helpers.ParticleSystem = function(options) {
    /**
     * The amount of particles in the cycle.
     * @type {number}
     */
    var amount = options['amount'] || 200;

    /**
     * The direction (+ speed) of a particle.
     * @type {Object}
     */
    var directions = options['directions'] || new THREE.Vector3(0.1, 0.1, 0.1);

    /**
     * Size of the particles.
     * @type {number}
     */
    var size = options['size'] || 1;

    /**
     * Texture of the particles.
     * @type {string|undefined}
     */
    var map = options['map'];

    /**
     * The color of the particles.
     * @type {number}
     */
    var color = options['color'] || 0xffffff;

    var geometry = new THREE.Geometry();
    for(var i=0; i<amount; i++) {
        geometry.vertices[i] = new THREE.Vector3(0, 0, 0);
        geometry.vertices[i].drift = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).multiply(directions);
    }

    this.cloud = new THREE.PointCloud(geometry, new THREE.PointCloudMaterial({ 'size': size, 'color': color, 'blending': THREE.AdditiveBlending, 'transparent': true, 'map': map }));
    this.cloud.offset = 0;
    this.cloud.directions = directions;
};

/**
 * Spawns a particle at the given position
 * @param {Object}  position   The position of the particle.
 * @param {Object=} rotation   The rotation of the particle.
 * @param {number=} randomness The randomness in the spawn position.
 */
l3.helpers.ParticleSystem.prototype.spawn = function(position, rotation, randomness) {
    this.cloud.offset = (this.cloud.offset+1) % this.cloud.geometry.vertices.length;
    if (randomness === undefined) {
        this.cloud.geometry.vertices[this.cloud.offset].copy(position);
    } else {
        var rand = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).multiplyScalar(randomness);
        this.cloud.geometry.vertices[this.cloud.offset].copy(position).add(rand);
    }

    if (rotation !== undefined) {
        this.cloud.geometry.vertices[this.cloud.offset].drift =
            new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5)
            .multiply(this.cloud.directions)
            .applyEuler(rotation);
    }
};

/**
 * Removes the particlesystem from the scene.
 */
l3.helpers.ParticleSystem.prototype.remove = function() {
    particleHandler.system.remove(this.cloud);
};

/**
 * Hides the particlesystem.
 */
l3.helpers.ParticleSystem.prototype.hide = function() {
    this.cloud.visible = false;
};

/**
 * Shows the particlesystem.
 */
l3.helpers.ParticleSystem.prototype.show = function() {
    this.cloud.visible = true;
};
