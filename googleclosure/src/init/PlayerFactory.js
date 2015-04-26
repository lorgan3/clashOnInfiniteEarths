goog.provide('l3.init.PlayerFactory');

goog.require('l3.objects.StateMachine');
goog.require('l3.objects.Player');

/**
 * Sets up a wizard player.
 * @param  {Object=}           position The position to place the player.
 * @return {l3.objects.Player}          The wizard.
 */
l3.init.PlayerFactory.Wizard = function(position) {
    // animatable model.
    var model = downloader.addClone('wizard', position, new THREE.Euler(0, -Math.PI/2, -Math.PI/2, 'XYZ'));
    model.material.materials[0].map = downloader.get('hero1Skin');
    l3.init.PlayerFactory.SetAnimations(model);
    model.canMove = true;
    model.canTurn = true;

    // play the flying animation
    model.animations[0].loop = true;
    model.animations[1].loop = true;
    model.animations[0].play(0, 0.01);

    // animationstates
    var stateMachine = new l3.objects.StateMachine(model);
    var player = new l3.objects.Player(model, stateMachine, {maxHp: 200});

    stateMachine.addState('punch', 0, function(e) {
        model.animations[2].play();
        animationListener.on(model.animations[2], 0.3, function(e) {
            var targets = collisionHelper.hit(player.worldposition, 2, player);
            if (targets[0] !== undefined) {
                targets[0].stateMachine.triggerState('getHit');
            }
        }).onEnd(model.animations[2], function(e) {
            stateMachine.stopState('punch');
        });
    }).addState('getHit', 1, function(e) {
        model.animations[1].play();
    });

    objectHandler.add(player);
    player.reticle = new THREE.Mesh(new THREE.SphereGeometry(0.3, 2, 2), new THREE.MeshBasicMaterial({ color: 0xff0000, 'wireframe': true }));
    scene2.add(player.reticle);

    // Add the players 2nd pivot to the scene rather than the model itself for the orbit to work.
    scene.add(player.pivot2);

    // Show the player's orbit
    if (debug === true) {
        var circleGeometry = new THREE.CircleGeometry(25, 32);
        circleGeometry.vertices.shift(); // Remove the center vertex
        var circle = new THREE.Line( circleGeometry, new THREE.LineBasicMaterial({ color: 0x00ff00 }));
        circle.rotation.x = Math.PI/2;
        player.pivot.add(circle);
    }
    return player;
};

/**
 * Sets up an astroid.
 * @param  {Object=}            position The position to place the astroid.
 * @return {l3.objects.Astroid}          The wizard.
 */
l3.init.PlayerFactory.Astroid = function(position) {
    var model = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshLambertMaterial({ color: 0x965D2F }));
    model.position.copy(position);

    var astroid = new l3.objects.Astroid(model);
    objectHandler.add(astroid);

    // Add the astroid's 2nd pivot to the scene rather than the model itself for the orbit to work.
    scene.add(astroid.pivot2);

    return astroid;
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