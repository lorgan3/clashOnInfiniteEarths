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
    for(var i in this.system.children) {
        var system = this.system.children[i];
        if (system.lifetime > 0) {
            system.lifetime--;
            if (system.lifetime === 0) {
                system.system.remove();
            }
        }
        if (system.active === false) {
            continue;
        }

        // If the system should automatically emit particles, do it here.
        if (system.emit > 0) {
            if (system.lastOffset === -1) {
                for(var j=0; j<system.emit; j++) {
                    system.system.spawn(system.position, undefined, 1);
                }
            } else {
                system.system.spawn(new THREE.Vector3(0, 0, 0));
                if (system.lastOffset >= system.offset) {
                    if (system.die === true) {
                        system.system.remove()
                    } else {
                        system.emit = 0;
                        system.active = false;
                    }
                }
            }
        }

        // Move the particles.
        for(var j in system.geometry.vertices) {
            system.geometry.vertices[j].add(system.geometry.vertices[j].drift);
        }

        system.geometry.verticesNeedUpdate = true;
    }
};