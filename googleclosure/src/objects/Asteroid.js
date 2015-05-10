goog.provide('l3.objects.Asteroid');

goog.require('l3.objects.BaseObject');

/**
 * An asteroid.
 * @param {Object}  model   The visual model of this asteroid.
 * @param {Object=} options An object containing all other options for this asteroid.
 *
 * @constructor
 * @implements {l3.objects.BaseObject}
 */
l3.objects.Asteroid = function(model, options) {
    options = options || {};

    /**
     * The model.
     * @type {Object}
     */
    this.model = model;

    /**
     * The size of this object (used for collisionchecking)
     * @type {number}
     */
    this.size = options.size || 2;

    // Set up pivots to aid with the orbit.
    this.pivot = new THREE.Object3D();
    this.pivot2 = new THREE.Object3D();
    this.pivot2.add(this.pivot);
    this.pivot2.isSprite = true;
    this.pivot.add(this.model);

    /**
     * The actual position in the world of this object.
     * @type {Object}
     */
    this.worldposition = new THREE.Vector3(0, 0, 0);

    /**
     * Current velocity.
     * @type {number}
     */
    this.speed = options.speed || 0.18;

    /**
     * Maximum velocity
     * @type {number}
     */
    this.maxSpeed = options.maxSpeed || 0.6;

    /**
     * Should this astroid broadcast its creation next frame.
     * @type {boolean}
     */
    this.shouldSync = false;
};

/** @inheritDoc */
l3.objects.Asteroid.prototype.serialize = function() {
    return { 'r': this.pivot.rotation.y,
             'd': new Float32Array(this.pivot2.matrix.elements),
             's': this.size,
             'o': this.model.position.z
           };
};

/** @inheritDoc */
l3.objects.Asteroid.prototype.deserialize = function(data) {
    this.pivot.rotation.y = data['r'];
    this.pivot2.matrix.elements = new Float32Array(data['d']);
    this.pivot2.rotation.setFromRotationMatrix(this.pivot2.matrix);
    this.size = data['s'];
    this.model.position.z = data['o'];

    var scale = this.size * 7.5 * particleFactor;
    this.model.scale.set(scale, scale, scale);
};

/** @inheritDoc */
l3.objects.Asteroid.prototype.serializeQuick = function() {
    return { 'r': this.pivot.rotation.y,
             's': this.speed
           };
};

/** @inheritDoc */
l3.objects.Asteroid.prototype.deserializeQuick = function(data) {
    this.pivot.rotation.y = data['r'];
    this.speed = data['s'];
};

/**
 * Function that updates the enity.
 * @param  {number} delta The time in ms since the last update.
 */
l3.objects.Asteroid.prototype.update = function(delta) {
    // Update the worldposition.
    this.worldposition.setFromMatrixPosition(this.model.matrixWorld);

    // Move the asteroid.
    this.pivot.rotation.y = (this.pivot.rotation.y + this.speed*delta) % (Math.PI*2);

    if (this.speed < this.maxSpeed) {
        this.speed += 0.0033 * delta / this.size;
    } else {
        this.speed = this.maxSpeed;
    }

    if (this.shouldSync === true) {
        // Because threeJS calculates the worldmatrix 1 frame after creating an object, the full update has to be sent now.
        this.shouldSync = false;
        networker.broadcast({ 'a': l3.main.Networking.States.ASTEROID_SPAWN, 'd': this.serialize() });
        console.log('yes');
    }
};

/**
 * Function to rotate an object around another objects axis.
 * @param  {Object} object  The mesh that should be rotated.
 * @param  {Object} axis    The axis to rotate it around.
 * @param  {number} radians The amount of rotation that should be applied.
 */
l3.objects.Asteroid.prototype.rotateAroundObjectAxis = function(object, axis, radians) {
    var rotObjectMatrix;
    rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);
    object.matrix.multiply(rotObjectMatrix);
    object.rotation.setFromRotationMatrix(object.matrix);
};

/** @inheritDoc */
l3.objects.Asteroid.prototype.collide = function(other) {
    if (networker.isHost === true) {
        networker.broadcast({ 'a': l3.main.Networking.States.ASTEROID_DIE, 'i': asteroids.indexOf(this) });
    }

    downloader.get('crush').play();
    var system = particleHandler.add({ 'amount': 150, 'position': this.worldposition, 'directions': new THREE.Vector3(0.15, 0.15, 0.15), 'size': 3 * this.size, 'map': downloader.get('particle'), 'lifetime': 60 });
    system.active = false;

    // Camera shake effect
    if (myself !== undefined) {
        var dist = players[myself].worldposition.distanceTo(this.worldposition);
        if (dist <= 10) {
            cameraHelper.shake(0.4, (11-dist)*15);
        }
    }

    // Spawn more asteroids.
    if (this.size > 0.5 && (networker.isHost === true || networker.token === undefined)) {
        for (var i=0; i<2; i++) {
            // If this was a punch, only spawn 1 asteroid.
            if (other instanceof l3.objects.Player) {
                i = 1;
            }

            var asteroid = l3.init.PlayerFactory.Asteroid(new THREE.Vector3(0, 0, this.model.position.z - 0.5), this.model.scale.x / 2, 'asteroid2');
            asteroid.size = this.size / 2;
            asteroid.pivot2.matrix.copy(this.pivot2.matrix);
            asteroid.pivot2.rotation.setFromRotationMatrix(this.pivot2.matrix);
            asteroid.pivot.rotation.y = this.pivot.rotation.y;
            asteroid.rotateAroundObjectAxis(asteroid.pivot2, new THREE.Vector3(0, 0, -1).applyEuler(asteroid.pivot.rotation), (Math.PI/2 + i*Math.PI));
            asteroid.shouldSync = true;
        }
    }

    // Big asteroids count as targets.
    if (this.size === 2 && networker.token === undefined) {
        hud.updateTargets();
    }

    objectHandler.remove(this);
};

/** @inheritDoc */
l3.objects.Asteroid.prototype.destroy = function() {
    world.remove(this.pivot2);
    delete this.model;
};
