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
 * @param  {number} x               The x position of the center of the attack.
 * @param  {number} y               The y position of the center of the attack.
 * @param  {number} range           The size of the attack.
 * @param  {Array.<Object>} targets A list of targets
 * @param  {boolean=} multi         Return the first hit or return all targets?
 * @return {Array.<Object>}         A list of targets within range.
 */
l3.helpers.CollisionHelper.prototype.hit = function(x, y, range, targets, multi) {
	var matches = [];
	var minX = x-range/2;
	var minY = y-range/2;
	var maxX = x+range/2;
	var maxY = y+range/2;

	for(var i in targets) {
		if (targets[i].model.position.x > minX && targets[i].model.position.z > minY &&
			targets[i].model.position.x < maxX && targets[i].model.position.z < maxY) {
			matches.push(targets[i]);
			if (multi !== true) {
				break;
			}
		}
	}

	return matches;
};
