goog.provide('l3.helpers.ObjectHandler');

/**
 * A handler that updates all objects it contains.
 * @constructor
 */
l3.helpers.ObjectHandler = function() {
    this.objects = [];
};

/**
 * Adds an object to the updater
 * @param {Object} object Adds an object to the updater.
 */
l3.helpers.ObjectHandler.prototype.add = function(object) {
    this.objects.push(object);

    // Also add to the players array.
    if (object instanceof l3.objects.Player) {
        players.push(object);
    }
};

/**
 * Removes an object from the updater.
 * @param  {Object} object The object that you want to remove.
 */
l3.helpers.ObjectHandler.prototype.remove = function(object) {
    this.objects.splice(this.objects.indexOf(object), 1);

    if (object instanceof l3.objects.Player) {
        players.splice(players.indexOf(object), 1);
    }
};

/**
 * Removes an object from the updater.
 * @param  {number} index The position of the object you want to update.
 */
l3.helpers.ObjectHandler.prototype.removeAt = function(index) {
    var object = this.objects[index];
    if (object instanceof l3.objects.Player) {
        players.splice(players.indexOf(object), 1);
    }

    this.objects.splice(index, 1);
};

/**
 * Updates all objects.
 * @param  {number} delta Time in ms since the last frame.
 */
l3.helpers.ObjectHandler.prototype.update = function(delta) {
    for(var i in this.objects) {
        this.objects[i].update(delta);

        // Detect if this object is colliding with another object in the 3d space.
        var v1 = new THREE.Vector3().setFromMatrixPosition( players[i].model.matrixWorld );
        for(var j in players) {
            if (i === j) {
                continue;
            }
            var v2 = new THREE.Vector3().setFromMatrixPosition( players[j].model.matrixWorld );

            if (v1.distanceTo(v2) < 2) {
                console.log('hit!');
                break;
            }
        }
    }
};