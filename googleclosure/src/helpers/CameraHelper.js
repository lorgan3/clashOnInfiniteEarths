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

    /**
     * The time that a camera shake lasts.
     * @type {number}
     */
    this.time = 0;

    /**
     * Intensity of the shake.
     * @type {number}
     */
    this.intensity = 100;

    /**
     * Was the camera following a player?
     * @type {boolean}
     */
    this.followedPlayer = false;
};

/**
 * Sets the target for the camera to folow.
 */
l3.helpers.CameraHelper.prototype.setUp = function() {
    var wasFollowingObject = false;
    if (this.target === world) {
        this.target.remove(this.camera);
    } else if (this.target !== null && this.target !== undefined && this.target.model !== undefined) {
        this.target.model.remove(this.camera);
    }

    if (myself === undefined || myself < 0) {
        hud.hide();
        this.target = world;
        this.camera.position.set(0, 0, 60);
        this.camera.lookAt(world.position);
        this.target.add(this.camera);

        // Scale the particles depending on the view.
        particleFactor = 0.3;
        if (this.followedPlayer === true) {
            this.followedPlayer = false;
            for (var i in particleHandler.system.children) {
                particleHandler.system.children[i].material.size *= particleFactor;
            }
            for (var i in world.children) {
                if (world.children[i] instanceof THREE.PointCloud) {
                    world.children[i].material.size *= particleFactor;
                } else if (world.children[i] instanceof THREE.Object3D) {
                    if (world.children[i].isSprite === true) {
                        var sprite = world.children[i].children[0].children[0];
                        var scale = sprite.scale.x * particleFactor;
                        sprite.scale.set(scale, scale, scale)
                    }
                }
            }
        }
    } else {
        this.target = players[myself];
        hud.show();

        this.target.model.add(this.camera);
        this.camera.rotation.x = -0.95;
        this.camera.rotation.z = 0;
        this.camera.rotation.y = 0;
        this.camera.position.set(0, 35, 25);

        scene2.remove(players[myself].reticle);
        players[myself].reticle = undefined;

        // Scale the particles depending on the view.
        particleFactor = 1;
        if (this.followedPlayer === false) {
            this.followedPlayer = true;
            for (var i in particleHandler.system.children) {
                particleHandler.system.children[i].material.size *= 3.33;
            }
            for (var i in world.children) {
                if (world.children[i] instanceof THREE.PointCloud) {
                    world.children[i].material.size *= 3.33;
                } else if (world.children[i] instanceof THREE.Object3D) {
                    if (world.children[i].isSprite === true) {
                        var sprite = world.children[i].children[0].children[0];
                        var scale = sprite.scale.x * 3.33;
                        sprite.scale.set(scale, scale, scale)
                    }
                }
            }
        }
    }
};

/**
 * Update step for camera effects.
 * @param {number} delta deltatime.
 */
l3.helpers.CameraHelper.prototype.update = function(delta) {
    if (this.time > 0) {
        this.time -= delta;
        if (this.time <= 0) {
            this.time = 0;
            this.camera.position.x = 0;
        } else {
            this.camera.position.x = (this.camera.position.x + (Math.random()-0.5) * this.intensity * delta) % (this.intensity/2);
        }
    }
};

/**
 * Causes the camera to shake.
 * @param {number}  time      How long should the camera shake (in seconds).
 * @param {number=} intensity How intense should it shake.
 */
l3.helpers.CameraHelper.prototype.shake = function(time, intensity) {
    this.time += time;
    this.intensity = intensity || 100;

    //Also vibrate using the html5 vibration api.
    if (window.navigator['vibrate'] !== undefined) {
        window.navigator['vibrate'](this.intensity * 1.5);
    }
};
