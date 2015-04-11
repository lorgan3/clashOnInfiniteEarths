goog.provide('l3.objects.Bot');

goog.require('l3.objects.Entity');
goog.require('l3.objects.StateMachine');

/**
 * A controlable object that represents a Bot
 * @param {Object}                  model        The visual model of this Bot.
 * @param {l3.objects.StateMachine} stateMachine This Bot's statemachine (used to perform actions).
 * @param {Object=}                 options      An object containing all other options for this Bot.
 *
 * @constructor
 * @implements {l3.objects.Entity}
 */
l3.objects.Bot = function(model, stateMachine, options) {
	this.model = model;
	this.stateMachine = stateMachine;

	options = options || {};
	this.maxHp = options.maxHp || 100;
	this.hp = options.hp || this.maxHp;

	this.pos = new THREE.Vector3(0.08, 0, 0);
};

/**
 * A function that returns a json object with all values that should be synced.
 * @return {Object} A json object containing all values that should be synced.
 */
l3.objects.Bot.prototype.serialize = function() {
	return {'x': this.model.position.x, 'y': this.model.position.z, 'r': Math.round(this.model.rotation.y/Math.PI*128), 'h': this.hp};
};

/**
 * A function that deserializes the data from the serialize method.
 * @param  {Object} json A json object containing all values that should be synced.
 */
l3.objects.Bot.prototype.deserialize = function(json) {
	this.model.position.x = json['x'];
	this.model.position.z = json['y'];
	this.model.rotation.y = json['r']*Math.PI/128;
	this.pos = new THREE.Vector3(0, 0, 0.08).applyEuler(this.model.rotation);
	this.hp = json['h'];
};

/**
 * Function that updates the enity.
 * @param  {number} delta The time in ms since the last update.
 */
l3.objects.Bot.prototype.update = function(delta) {
	if (this.hp <= 0) {
		return;
	}

	/*if (!collisionHelper.collide(this.model.position.x + this.pos.x, this.model.position.z + this.pos.z)) {
		this.model.position.add(this.pos);
	}*/
};

/**
 * Function that updates the state of the enemy.
 */
l3.objects.Bot.prototype.aiUpdate = function() {
	//this.model.rotation.y = Math.random()*Math.PI*2;
	this.model.rotation.y = Math.atan2(this.model.position.x - players[0].model.position.x, this.model.position.z - players[0].model.position.z) + Math.PI;
	this.pos = new THREE.Vector3(0, 0, 0.08).applyEuler(this.model.rotation);
};

/**
 * Damages this bot.
 * @param  {number} amount The amount of damage inflicted.
 */
l3.objects.Bot.prototype.damage = function(amount) {
	this.hp -= amount;

	if (this.hp <= 0 && networker.isHost) {
		var i = enemies.indexOf(this);
		networker.broadcast({'a': l3.main.Networking.States.OBJECT_DEATH, 'i': i});
		networker.removeEnemy(i);
	}
};

/**
 * Kills the object
 */
l3.objects.Bot.prototype.destroy = function() {
	scene.remove(this.model);
	delete this.model;
	delete this.stateMachine;
}