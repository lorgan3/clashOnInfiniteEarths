goog.provide('l3.helpers.ObjectHandler');

/**
 * A handler that updates all objects it contains.
 * @constructor
 */
l3.helpers.ObjectHandler = function() {
    /**
     * An array that contains all object that will be updated.
     * @type {Array.<l3.objects.BaseObject>}
     */
    this.objects = [];

    /**
     * Is this the first frame?
     * @type {boolean}
     */
    this.firstFrame = true;
};

/**
 * Adds an object to the updater
 * @param {l3.objects.BaseObject} object Adds an object to the updater.
 */
l3.helpers.ObjectHandler.prototype.add = function(object) {
    this.objects.push(object);

    // Also add to the players array.
    if (object instanceof l3.objects.Player) {
        players.push(object);
    } else if (object instanceof l3.objects.Astroid) {
        astroids.push(object);
    }
};

/**
 * Removes an object from the updater.
 * @param  {l3.objects.BaseObject} object The object that you want to remove.
 */
l3.helpers.ObjectHandler.prototype.remove = function(object) {
    this.objects.splice(this.objects.indexOf(object), 1);

    if (object instanceof l3.objects.Player) {
        players.splice(players.indexOf(object), 1);
    } else if (object instanceof l3.objects.Astroid) {
        astroids.splice(astroids.indexOf(object), 1);
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
    } else if (object instanceof l3.objects.Astroid) {
        astroids.splice(astroids.indexOf(object), 1);
    }

    this.objects.splice(index, 1);
};

/**
 * Updates all objects.
 * @param  {number} delta Time in ms since the last frame.
 */
l3.helpers.ObjectHandler.prototype.update = function(delta) {
    for(var i in this.objects) {
        var obj = this.objects[i];
        obj.update(delta);

        if (this.firstFrame === false) {
            // Check for collisions
            for(var j in this.objects) {
                if (i === j) {
                    continue;
                }

                if (obj.worldposition.distanceTo(this.objects[j].worldposition) < (obj.size + this.objects[j].size) / 2) {
                    obj.collide(this.objects[j]);
                    break;
                }
            }
        }
    }
    this.firstFrame = false;
};