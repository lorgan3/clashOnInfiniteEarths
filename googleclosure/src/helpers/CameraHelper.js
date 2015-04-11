goog.provide('l3.helpers.CameraHelper');

/**
 * A helper for the 3d camera
 * @param {Object} camera The camera.
 * @param {Object} offset The offset from the target.
 * @constructor
 */
l3.helpers.CameraHelper = function(camera, offset) {
	this.target = null;
	this.camera = camera;
	this.offset = offset;

    this.camera.position.x = offset.x;
	this.camera.position.y = offset.y;
	this.camera.position.z = offset.z;
};

/**
 * Sets the target for the camera to folow.
 */
l3.helpers.CameraHelper.prototype.setUp = function() {
	if (myself === undefined) {
		return;
	}

	this.target = players[myself].model;

	this.update();
	this.camera.lookAt(this.target.position);
};

/**
 * Updates the cameraposition to keep folowing the target.
 */
l3.helpers.CameraHelper.prototype.update = function() {
	if (this.target === null) {
		return false;
	}

	this.camera.position.x = this.offset.x + this.target.position.x;
	this.camera.position.z = this.offset.z + this.target.position.z;
};