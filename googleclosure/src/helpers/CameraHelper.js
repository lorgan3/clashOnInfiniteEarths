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
    if (this.target !== null) {
        this.target.remove(this.camera);
    }

    if (myself === undefined || myself < 0) {
        this.target = world;
        this.camera.position.set(0, 0, 100);
        this.camera.lookAt(world.position);
        this.target.add(this.camera);
    } else {
        this.target = players[myself].model;

        this.target.add(this.camera);
        this.camera.rotation.x = -1.20;
        this.camera.rotation.y = 0;
        this.camera.rotation.z = 0;
        this.camera.position.set(0, 50, 10);

        scene2.remove(players[myself].reticle);
        players[myself].reticle = undefined;
    }
};
