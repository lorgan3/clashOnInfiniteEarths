goog.provide('l3.objects.BaseObject');

/**
 * An object that needs to be Updated regulary.
 * @interface
 */
l3.objects.BaseObject = function() {};

/**
 * Updates the object.
 * @param  {number}  delta Time since the last frame.
 */
l3.objects.BaseObject.prototype.update = function(delta) {};

/**
 * A function that returns a json object with all values that should be synced.
 * @return {Object} A json object containing all values that should be synced.
 */
l3.objects.BaseObject.prototype.serialize = function() {};

/**
 * A function that deserializes the data from the serialize method.
 * @param  {Object} json A json object containing all values that should be synced.
 */
l3.objects.BaseObject.prototype.deserialize = function(json) {};

/**
 * A handler that gets executed when this object collides with another.
 * @param  {l3.objects.BaseObject} other The other object.
 */
l3.objects.BaseObject.prototype.collide = function(other) {};
