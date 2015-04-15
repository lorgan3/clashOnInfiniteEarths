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
 * @param  {Object}                    options The options for this particlesystem.
 * @return {l3.helpers.ParticleSystem} The created particlesystem.
 */
l3.helpers.ParticleHandler.prototype.add = function(options) {
    var system = new l3.helpers.ParticleSystem(options);
    this.system.add(system.cloud);
    return system;
};

/**
 * Updates all child particle systems.
 */
l3.helpers.ParticleHandler.prototype.update = function() {
    console.log(this.system.children);
    for(var i in this.system.children) {
        var system = this.system.children[i];

        /*if (system._index === system._lastIndex) {
            this.system.remove(system);
            continue;
        }*/

        for(var j in system.geometry.vertices) {
            system.geometry.vertices[j].add(system.geometry.vertices[j].drift);
        }

        system.geometry.verticesNeedUpdate = true;
    }
};