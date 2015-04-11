goog.provide('l3.objects.Entity');

/**
 * An enity that is synced and can move.
 * @interface
 */
l3.objects.Entity = function() {};

/**
 * A function that returns a json object with all values that should be synced.
 * @return {Object} A json object containing all values that should be synced.
 */
l3.objects.Entity.prototype.serialize = function() {};

/**
 * A function that deserializes the data from the serialize method.
 * @param  {Object} json A json object containing all values that should be synced.
 */
l3.objects.Entity.prototype.deserialize = function(json) {};

/**
 * Function that updates the enity.
 * @param  {number} delta The time in ms since the last update.
 */
l3.objects.Entity.prototype.update = function(delta) {};