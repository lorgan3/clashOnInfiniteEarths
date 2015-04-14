goog.provide('l3.helpers.PointerLockHelper');

/**
 * A helper to use the HTML5 pointer lock api.
 *
 * @constructor
 */
l3.helpers.PointerLockHelper = function() {
    this.locked = false;
    this.element = undefined;

    document.addEventListener('pointerlockchange', this.lockChange, false);
    document.addEventListener('mozpointerlockchange', this.lockChange, false);
    document.addEventListener('webkitpointerlockchange', this.lockChange, false);
};

/**
 * Locks ther cursor to a certain element.
 * @param  {HTMLElement} element The element to lock.
 */
l3.helpers.PointerLockHelper.prototype.lock = function(element) {
    this.element = element;
    element.lock = element['requestPointerLock'] || element['mozRequestPointerLock'] || element['webkitRequestPointerLock'];
    if (element !== undefined && element.lock !== undefined) {
        element.lock();
    }
};

/**
 * Unlocks the cursor.
 */
l3.helpers.PointerLockHelper.prototype.unlock = function() {
    var unlock = document['exitPointerLock'] || document['mozExitPointerLock'] || document['webkitExitPointerLock'];
    if (unlock !== undefined) {
        unlock();
    }
};

/**
 * Eventhandler that checks if the element got the pointerlock.
 */
l3.helpers.PointerLockHelper.prototype.lockChange = function() {
    var element = document['pointerLockElement'] || document['mozPointerLockElement'] || document['webkitPointerLockElement'];
    if (element === this.element) {
        this.locked = true;
    } else {
        this.locked = false;
    }
};
