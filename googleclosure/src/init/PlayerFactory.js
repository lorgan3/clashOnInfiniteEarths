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
        if (myself === players.indexOf(player)) {
            hud.regenerate();
        }
        model.animations[2].play();
        var snd = downloader.get('swing').play();
        if (myself !== undefined) {
            var dist = player.worldposition.distanceTo(players[myself].worldposition);
            if (dist < 20) {
                snd.volume((20-dist)/20);
            }
        }
        animationListener.on(model.animations[2], 0.3, function(e) {
            var target = collisionHelper.hit(player.punchWorldposition.add(player.worldposition), 0.8, player)[0];
            if (target !== undefined) {
                if (target instanceof l3.objects.Player || target instanceof l3.objects.Asteroid) {
                    if (networker.isHost === true || networker.token === undefined) {
                        target.collide(player);
                    }
                    var snd = downloader.get('punch').play();
                    if (myself !== undefined) {
                        var dist = player.worldposition.distanceTo(players[myself].worldposition);
                        if (dist < 20) {
                            snd.volume((20-dist)/20);
                        }
                    }
                    particleHandler.add({ 'amount': 1, 'directions': new THREE.Vector3(0, 0, 0), 'size': 50, 'map': downloader.get('pow'), 'lifetime': 60, 'blending': THREE.NormalBlending }).spawn(target.worldposition);
                }
            }
        }).onEnd(model.animations[2], function(e) {
            stateMachine.stopState('punch');
        });
    }).addState('laser', 1, function(e) {
        if (myself === players.indexOf(player)) {
            hud.regenerate();
        }
        model.animations[2].play();
        var laser = l3.init.PlayerFactory.Laser(new THREE.Vector3(0, 0, world.orbit-1.5));
        laser.pivot2.matrix.copy(player.pivot2.matrix);
        laser.pivot2.rotation.setFromRotationMatrix(laser.pivot2.matrix);
        laser.pivot.rotation.y = player.pivot.rotation.y+Math.PI/20;
        laser.owner = player;
        window.setTimeout(function() {
            stateMachine.stopState('laser');
        }, 3000);
    }).addState('speed', 2, function(e) {
        if (myself === players.indexOf(player)) {
            hud.regenerate();
        }
        player.move = true;
        window.setTimeout(function() {
            player.move = false;
        }, 1000);
        window.setTimeout(function() {
            stateMachine.stopState('speed');
        }, 5000);
    }).addState('getHit', 3, function(e) {
        stateMachine.stopState('punch');
        stateMachine.stopState('laser');
        model.animations[2].stop();
        model.animations[1].play();
    });

    objectHandler.add(player);
    player.reticle = new THREE.Mesh(new THREE.SphereGeometry(0.3, 2, 2), new THREE.MeshBasicMaterial({ color: 0xff0000, 'wireframe': true }));
    scene2.add(player.reticle);

    // Add the players 2nd pivot to the scene rather than the model itself for the orbit to work.
    scene.add(player.pivot2);

    // Show the player's orbit
    if (debug === true) {
        var circleGeometry = new THREE.CircleGeometry(position.z, 32);
        circleGeometry.vertices.shift(); // Remove the center vertex
        var circle = new THREE.Line( circleGeometry, new THREE.LineBasicMaterial({ color: 0x00ff00 }));
        circle.rotation.x = Math.PI/2;
        player.pivot.add(circle);
    }
    return player;
};

/**
 * Sets up an asteroid.
 * @param  {Object=}             position The position to place the asteroid.
 * @param  {number=}             size     The size of this asteroid.
 * @param  {string=}             sprite   Which sprite to use for this astroid.
 * @return {l3.objects.Asteroid}          The asteroid.
 */
l3.init.PlayerFactory.Asteroid = function(position, size, sprite) {
    size = size || 15;
    sprite = sprite || 'asteroid1';

    //var model = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshLambertMaterial({ color: 0x965D2F }));
    var model = new THREE.Sprite(new THREE.SpriteMaterial({'map': downloader.get(sprite), 'color': 0xffffff }));
    model.scale.set(size*particleFactor, size*particleFactor, size*particleFactor);
    model.position.copy(position);

    var asteroid = new l3.objects.Asteroid(model);
    objectHandler.add(asteroid);

    // Add the asteroid's 2nd pivot to the scene rather than the model itself for the orbit to work.
    world.add(asteroid.pivot2);

    return asteroid;
};

/**
 * Sets up a laser.
 * @param  {Object=}            position The position to place the laser.
 * @return {l3.objects.Laser}            The laser.
 */
l3.init.PlayerFactory.Laser = function(position) {
    var model = downloader.addClone('laser', position, new THREE.Euler(0, 0, -Math.PI/2, 'XYZ'));
    model.material = new THREE.MeshBasicMaterial({ color: 0xff0000 })

    var laser = new l3.objects.Laser(model);
    objectHandler.add(laser);

    // Add the laser's 2nd pivot to the scene rather than the model itself for the orbit to work.
    scene.add(laser.pivot2);

    return laser;
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