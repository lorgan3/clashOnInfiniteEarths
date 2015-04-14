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
    var model = downloader.addClone('wizard', position, new THREE.Euler(0, 0, -Math.PI/2, 'XYZ'));
    model.material.materials[0].map = downloader.get('hero1Skin');
    l3.init.PlayerFactory.SetAnimations(model);
    model.canMove = true;
    model.canTurn = true;

    model.animations[0].loop = true;
    model.animations[0].play();

    // animationstates
    var stateMachine = new l3.objects.StateMachine(model);
    var player = new l3.objects.Player(model, stateMachine, {maxHp: 200});

    // Add the players 2nd pivot to the scene rather than the model itself for the orbit to work.
    scene.add(player.pivot2);

    // Show extra lines while debugging
    if (debug === true) {
        // Show the player's wireframe
        var edges = new THREE.EdgesHelper(model, 0x00ff00, 20);
        scene2.add(edges);

        // Show the player's orbit
        var circleGeometry = new THREE.CircleGeometry(25, 32);
        circleGeometry.vertices.shift(); // Remove the center vertex
        var circle = new THREE.Line( circleGeometry, new THREE.LineBasicMaterial({ color: 0x00ff00 }));
        circle.rotation.x = Math.PI/2;
        player.pivot.add(circle);
    }
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