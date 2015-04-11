goog.provide('l3.objects.BaseObject');

/**
 * An object that needs to be Updated regulary.
 * @interface
 */
l3.objects.BaseObject = function() {};

/**
 * Updates the object.
 * @param  {number}  delta Time since the last frame.
 * @return {boolean}       Should the object continue to be updated?
 */
l3.objects.BaseObject.prototype.update = function(delta) {};

/**
 * Occurs when the object gets removed.
 */
l3.objects.BaseObject.prototype.die = function() {};