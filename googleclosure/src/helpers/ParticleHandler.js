goog.provide('l3.helpers.ParticleHandler');
goog.require('l3.helpers.ParticleSystem');

/**
 * Object that handles particles.
 * @constructor
 */
l3.helpers.ParticleHandler = function() {
    this.system = new THREE.Object3D();
    scene.add(this.system);
};

/**
 * Adds a particle system.
 * @param {Object}                     position  The spawn position.
 * @param {Object}                     offset    Maximum random offset from spawn position.
 * @param {Object}                     direction The direction of the particles.
 * @param {number}                     speed     The speed of the particles.
 * @param {number}                     speed_var The speed variation.
 * @param {number}                     length    The length of the particle stream.
 * @param {number}                     density   The density of the particle stream (the amount of particles that get placed every update).
 * @param {number}                     color     The color of the particles.
 * @return {l3.helpers.ParticleSystem}           The created particlesystem.
 */
l3.helpers.ParticleHandler.prototype.add = function(position, offset, direction, speed, speed_var, length, density, color) {
    var system = new l3.helpers.ParticleSystem(position, offset, direction, speed, speed_var, length, density, color);
    this.system.add(system.cloud);
    return system;
};

/**
 * Updates all child particle systems.
 */
l3.helpers.ParticleHandler.prototype.update = function() {
    for(var i in this.system.children) {
        var system = this.system.children[i];

        if (system._index === system._lastIndex) {
            this.system.remove(system);
            continue;
        }

        for(var j=0; j<system._density; j+=1) {
            system.geometry.vertices[system._index]
                .copy(system._position)
                .add(new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5)
                    .multiply(system._offset));

            system._index = (system._index+1) % system.geometry.vertices.length;
        }
        for(var k in system.geometry.vertices) {
            system.geometry.vertices[k].add(system.geometry.vertices[k]._direction);
        }

        system.geometry.verticesNeedUpdate = true;
    }
};  