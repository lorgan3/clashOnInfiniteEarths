goog.provide('l3.helpers.CollisionHelper');

/**
 * An object that manages collisions.
 * @param {boolean} debug Draw debug information?
 *
 * @constructor
 */
l3.helpers.CollisionHelper = function(debug) {
    if (debug === true) {
        scene.add(new THREE.GridHelper(30, 1));
    }
};

/**
 * Checks if one of the targets are within range.
 * @param  {Object}                       position The position of the center of the attack.
 * @param  {number}                       range    The size of the attack.
 * @param  {l3.objects.BaseObject}        self     An object that should be excluded from the collisioncheck.
 * @param  {boolean=} multi                        Return the first hit or return all targets?
 * @return {Array.<l3.objects.BaseObject>}         A list of targets within range.
 */
l3.helpers.CollisionHelper.prototype.hit = function(position, range, self, multi) {
    if (time === 0) {
        return [];
    }

    var matches = [];

    for(var i in objectHandler.objects) {
        var other = objectHandler.objects[i];
        if (other === self) {
            continue;
        }

        if (other.worldposition.distanceTo(position) < (other.size/2 + range)) {
            matches.push(other);
            if (multi !== true) {
                break;
            }
        }
    }

    return matches;
};
