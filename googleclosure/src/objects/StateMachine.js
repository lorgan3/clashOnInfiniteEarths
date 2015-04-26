goog.provide('l3.objects.StateMachine');

/**
 * Represents an object that can only be in 1 state of the same group at the same time.
 * @param {Object}                model     The model this statemachine is linked to.
 * @constructor
 */
l3.objects.StateMachine = function(model) {
	this.states = [];
	this.groups = [];

	this.model = model;
};

/**
 * Adds a state to the statemachine.
 * @param {string}                   name     The state's name.
 * @param {number}                   group    The group to which this state belongs to.
 * @param {Function}                 callback The callback when the state gets selected.
 * @return {l3.objects.StateMachine}          The statemachine for easy chaining.
 */
l3.objects.StateMachine.prototype.addState = function(name, group, callback) {
	this.states[name] = {group: group, callback: callback};
	return this;
};

/**
 * Triggers a state.
 * @param  {number|string} state  The state that should be triggered
 * @param  {...?}          params The parameters to trigger the state with.
 * @return {boolean}              True if the state got set.
 */
l3.objects.StateMachine.prototype.triggerState = function(state, params) {
	var cur = this.states[state];
	if (this.groups[cur.group] === true) {
		return false;
	}

	this.groups[cur.group] = true;

	// Vars for the callback.
	var model = this.model;
	cur.callback(params);
	return true;
};

/**
 * Stops a state
 * @param {number|string} state The state that should be stopped.
 */
l3.objects.StateMachine.prototype.stopState = function(state) {
	var cur = this.states[state];
	this.groups[cur.group] = false;
};
