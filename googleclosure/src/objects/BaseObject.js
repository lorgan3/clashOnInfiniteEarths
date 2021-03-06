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
 * @param  {Object} data A json object containing all values that should be synced.
 */
l3.objects.BaseObject.prototype.deserialize = function(data) {};

/**
 * A function that returns a json object with all values that should be synced for a quick update.
 * @return {Object} A json object containing all values that should be synced.
 */
l3.objects.BaseObject.prototype.serializeQuick = function() {};

/**
 * A function that deserializes the data from the serializeQuick method.
 * @param  {Object} data A json object containing all values that should be synced.
 */
l3.objects.BaseObject.prototype.deserializeQuick = function(data) {};

/**
 * A handler that gets executed when this object collides with another.
 * @param  {l3.objects.BaseObject=} other The other object.
 */
l3.objects.BaseObject.prototype.collide = function(other) {};

/**
 * Function that destroys the object.
 */
l3.objects.BaseObject.prototype.destroy = function() {};
