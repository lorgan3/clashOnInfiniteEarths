goog.provide('l3.objects.Player');

goog.require('l3.objects.Entity');
goog.require('l3.objects.StateMachine');

/**
 * A controlable object that represents a player
 * @param {Object}                  model        The visual model of this player.
 * @param {l3.objects.StateMachine} stateMachine This player's statemachine (used to perform actions).
 * @param {Object=}                 options      An object containing all other options for this player.
 *
 * @constructor
 * @implements {l3.objects.Entity}
 */
l3.objects.Player = function(model, stateMachine, options) {
	this.model = model;
	this.stateMachine = stateMachine;

	this.attack = false;
	this.move = false;
	this.scroll = 0;
	this.rotation = 0;

	this.name = 'player';
	this.color = colors[0];

	this.zRot = 0;
	this.yRot = 0;

	options = options || {};
	this.maxHp = options.maxHp || 100;
	this.hp = options.hp || this.maxHp;

};

/**
 * A function that returns a json object with all values that should be synced.
 * @return {Object} A json object containing all values that should be synced.
 */
l3.objects.Player.prototype.serialize = function() {
	return {'x': this.model.position.x, 'y': this.model.position.z, 'r': this.rotation, 'h': this.hp};
};

/**
 * A function that deserializes the data from the serialize method.
 * @param  {Object} data A json object containing all values that should be synced.
 */
l3.objects.Player.prototype.deserialize = function(data) {
	this.model.position.x = data['x'];
	this.model.position.z = data['y'];
	this.rotation = data['r'];
	this.hp = data['h'];
};

/**
 * Serializes the player input state.
 */
l3.objects.Player.prototype.serializeState = function() {
	return {'a': this.attack, 'm': this.move, 'r': this.rotation};
};

/**
 * Deserializes the player input state.
 * @param {Object} data The state data.
 */
l3.objects.Player.prototype.deserializeState = function(data) {
	this.attack = data['a'];
	this.move = data['m'];
	this.rotation = data['r'];
};

/**
 * Function that updates the enity.
 * @param  {number} delta The time in ms since the last update.
 */
l3.objects.Player.prototype.update = function(delta) {
	//this.model.position.x += 0.05;
	//var tanx = Math.atan2(world.position.z-this.model.position.z, world.position.y-this.model.position.y);
	//var tany =  Math.atan2(world.position.z-this.model.position.z, this.model.position.x-world.position.x);
	//this.model.rotation.x = tanx + Math.PI/2;
	//this.model.rotation.y = tany + Math.PI/2;
	//this.model.rotation.z = Math.PI/2;
	//console.log(this.model.rotation.y);

	this.yRot += 0.01;
	//this.zRot = Math.PI/4;
	this.model.position.x = Math.cos(this.zRot) * Math.sin(this.yRot) * 25;
	this.model.position.y = Math.sin(this.zRot) * Math.sin(this.yRot) * 25;
	this.model.position.z = Math.cos(this.yRot) * 25;

	this.model.rotation.z = -this.zRot - Math.PI/2;
	this.model.rotation.y = this.yRot;
	//this.model.rotation.x = this.zRot;

	//console.log(this.model.position.x + ', ' + this.model.position.y + ', ' + this.model.position.z);

	//console.log(this.model.rotation.z);
	//this.model.rotation.z = Math.PI/2;
	//this.model.rotation.z = Math.PI/2;
	//console.log(new THREE.Vector3(0, 0.1, 0).applyEuler(this.model.rotation));
	//this.model.position.add(new THREE.Vector3(0, 1, 0).applyEuler(this.model.rotation));
	/*if (this.move === true && this.model.canMove === true) {
		var pos = new THREE.Vector3(0, 0, 4 * delta).applyEuler(this.model.rotation);

		if (!collisionHelper.collide(this.model.position.x + pos.x, this.model.position.z + pos.z)) {
			this.model.position.add(pos);
		}
	}*/

	/*if (this.model.canTurn) {
		this.model.rotation.z = this.rotation;
		this.zRot = this.rotation;
	}*/

	/*if (this.attack === true) {
		this.stateMachine.triggerState('attack');
	}

	if (this.scroll !== 0) {
		this.stateMachine.triggerState('switch', this.scroll);
	}*/
};

/**
 * Function that destroys the entity.
 */
l3.objects.Player.prototype.destroy = function() {
	scene.remove(this.model);
	delete this.model;
	delete this.stateMachine;
};