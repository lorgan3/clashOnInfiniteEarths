goog.provide('l3.init.PlayerFactory');

goog.require('l3.objects.StateMachine');
goog.require('l3.objects.Player');
goog.require('l3.objects.Bot');

/**
 * Sets up a wizard player.
 * @param  {Object=}           position The position to place the player.
 * @return {l3.objects.Player}          The wizard.
 */
l3.init.PlayerFactory.Wizard = function(position) {
    // animatable model.
    var model = downloader.addClone('wizard', position, new THREE.Euler(0, 0, 0, 'XYZ'), scene);
    model.material.materials[0].depthTest = false;
    l3.init.PlayerFactory.SetAnimations(model);
    model.canMove = true;
    model.canTurn = true;

    // animationstates
    var stateMachine = new l3.objects.StateMachine(model);
    var player = new l3.objects.Player(model, stateMachine, {maxHp: 200});
    return player;
};

/**
 * Makes the model animatable and sets up the animations.
 * @param {Object} model The model to make animatable.
 * @protected
 */
l3.init.PlayerFactory.SetAnimations = function(model) {
    for (var i in model.material.materials) {
        model.material.materials[i].skinning = true;
    }

    model.animations = [];
    for(var i in model.geometry.animations) {
        model.animations[i] = new THREE.Animation(model, model.geometry.animations[i]);
        model.animations[i].loop = false;
    }

    // Force to model in rest position.
    if (model.animations.length > 0) {
        model.animations[0].play();
        model.animations[0].update(0);
        model.animations[0].stop();
    }
};