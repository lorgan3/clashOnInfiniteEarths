goog.provide('l3.helpers.AnimationListener');

/**
 * Helper that can listen for animation ends.
 * @constructor
 */
l3.helpers.AnimationListener = function() {
    this.timedAnimations = [];
    this.endingAnimations = [];
}

/**
 * Goes over all registered animations and checks if they ended yet.
 */
l3.helpers.AnimationListener.prototype.update = function() {
    for (var i in this.timedAnimations) {
        var current = this.timedAnimations[i];
        if (current.a.currentTime >= current.t) {
            current.c(current.a);
            this.timedAnimations.splice(i, 1);
        }
    }
    for (var i in this.endingAnimations) {
        var current = this.endingAnimations[i];
        if (current.a.isPlaying === false) {
            current.c(current.a);
            this.endingAnimations.splice(i, 1);
        }
    }
}

/**
 * Listen for a new animation event.
 * @param  {Object}                       animation The animation.
 * @param  {number}                       time      Threshold time.
 * @param  {Function}                     callback  The callback that runs when the animation passed the treshold.
 * @return {l3.helpers.AnimationListener}           The listener for easy chaining.
 */
l3.helpers.AnimationListener.prototype.on = function(animation, time, callback) {
    this.timedAnimations.push({a: animation, t: time, c: callback});
    return this;
}

/**
 * Listen for a new animation event.
 * @param  {Object}   animation The animation.
 * @param  {Function} callback  The callback that runs when the animation ends.
 */
l3.helpers.AnimationListener.prototype.onEnd = function(animation, callback) {
    this.endingAnimations.push({a: animation, c: callback});
}