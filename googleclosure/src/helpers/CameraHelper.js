goog.provide('l3.helpers.CameraHelper');

/**
 * A helper for the 3d camera
 * @param {Object} camera The camera.
 * @constructor
 */
l3.helpers.CameraHelper = function(camera) {
    /**
     * The model or scene that the camera is currently attached to.
     * @type {Object}
     */
    this.target = null;

    /**
     * The camera to manipulate.
     * @type {Object}
     */
    this.camera = camera;
};

/**
 * Sets the target for the camera to folow.
 */
l3.helpers.CameraHelper.prototype.setUp = function() {
    var wasFollowingObject = false;
    if (this.target !== null) {
        wasFollowingObject = (this.target instanceof l3.objects.BaseObject);
        this.target.remove(this.camera);
    }

    if (myself === undefined || myself < 0) {
        this.target = world;
        this.camera.position.set(0, 0, 60);
        this.camera.lookAt(world.position);
        this.target.add(this.camera);

        // Scale the particles depending on the view.
        particleFactor = 0.3;
        if (wasFollowingObject === true) {
            for (var i in particleHandler.system.children) {
                particleHandler.system.children[i].material.size *= particleFactor;
            }
            for (var i in world.children) {
                if (world.children[i] instanceof THREE.PointCloud) {
                    world.children[i].material.size *= particleFactor;
                }
            }
        }
    } else {
        this.target = players[myself].model;

        this.target.add(this.camera);
        this.camera.rotation.x = -0.95;
        this.camera.rotation.z = 0;
        this.camera.rotation.y = 0;
        this.camera.position.set(0, 35, 25);

        scene2.remove(players[myself].reticle);
        players[myself].reticle = undefined;

        // Scale the particles depending on the view.
        particleFactor = 1;
        if (wasFollowingObject === false) {
            for (var i in particleHandler.system.children) {
                particleHandler.system.children[i].material.size *= 3.33;
            }
            for (var i in world.children) {
                if (world.children[i] instanceof THREE.PointCloud) {
                    world.children[i].material.size *= 3.33;
                }
            }
        }
    }
};
