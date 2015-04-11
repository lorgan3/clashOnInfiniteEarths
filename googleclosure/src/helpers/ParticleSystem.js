goog.provide('l3.helpers.ParticleSystem');

/**
 * Creates a particle system.
 * @param {Object}          position  The spawn position.
 * @param {Object}          offset    Maximum random offset from spawn position.
 * @param {Object}          direction The direction of the particles.
 * @param {number}          speed     The speed of the particles.
 * @param {number}          speed_var The speed variation.
 * @param {number}          length    The length of the particle stream.
 * @param {number}          density   The density of the particle stream (the amount of particles that get placed every update).
 * @param {number}          color     The color of the particles.
 * @constructor
 */
l3.helpers.ParticleSystem = function(position, offset, direction, speed, speed_var, length, density, color) {
    direction = direction || new THREE.Vector3(0,0,0);
    direction.normalize();
    direction.multiplyScalar(speed);

    var geometry = new THREE.Geometry();
    for(var i=0; i<length*density*4; i++) {
        geometry.vertices[i] = new THREE.Vector3(999999, 999999, 999999);
        geometry.vertices[i]._direction = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5);
        geometry.vertices[i]._direction.multiplyScalar(speed * speed_var);
        geometry.vertices[i]._direction.add(direction);
    }

    this.cloud = new THREE.PointCloud(geometry, new THREE.PointCloudMaterial({'size': 0.4, 'color': color, 'blending': THREE.AdditiveBlending, 'depthTest': true, 'transparent': true, 'map': downloader.get('particle')}));

    this.cloud._position = position || new THREE.Vector3(0, 0, 0);
    this.cloud._offset = offset || new THREE.Vector3(0, 0, 0);
    this.cloud._density = density;
    this.cloud._index = 0;
    this.cloud._lastIndex = -1;
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

/**
 * Stops spawning new particles and kills the system after that.
 */
l3.helpers.ParticleSystem.prototype.die = function() {
    this.cloud._lastIndex = (this.cloud._index - this.cloud._density + this.cloud.geometry.vertices.length) % this.cloud.geometry.vertices.length;
    this.cloud._position = new THREE.Vector3(999999, 999999, 999999);
};