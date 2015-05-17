goog.provide('l3.main');

goog.require('l3.helpers.AnimationListener');
goog.require('l3.helpers.ParticleHandler');
goog.require('l3.helpers.ParticleSystem');
goog.require('l3.helpers.ObjectHandler');
goog.require('l3.helpers.CameraHelper');
goog.require('l3.main.Control');
goog.require('l3.main.Networking');
goog.require('l3.init.Downloader');
goog.require('l3.init.PlayerFactory');
goog.require('l3.helpers.CollisionHelper');
goog.require('l3.html.Panel');
goog.require('l3.html.ClassSelect');
goog.require('l3.html.Hud');
goog.require('l3.objects.Asteroid');
goog.require('l3.helpers.PointerLockHelper');
goog.require('l3.objects.Laser');

/**
 * Show debug information?
 *
 * @type {boolean}
 */
var debug = false;

/**
 * An array that contains all playable characters.
 * @type {Array.<l3.objects.BaseObject>}
 */
var players = [];

/**
 * An array that contains all other objects that should be synchronized.
 * @type {Array.<l3.objects.BaseObject>}
 */
var asteroids = [];

/**
 * A number that indicates which character in the Players array that you control.
 * @type {number|undefined}
 */
var myself = undefined;

/**
 * The amount by which the particles need to be resized depending on what view the camera is currently in.
 * @type {number}
 */
var particleFactor = 0.3;

/**
 * The planet which everything revolves around.
 * This object should also contain an orbit value.
 * @type {Object}
 */
var world;

// Extra global variables.
var scene, camera, animationListener, particleHandler, objectHandler, cameraHelper, scene2, game, panel, stats, classSelect, hud,
    networker, downloader, collisionHelper, pointerLockHelper, control, webGLRenderer, spotLight, light, clock;

/**
 * Starts the game.
 * @param  {boolean}  isHost         Are you the host?
 * @param  {string=}  token          The peer token.
 * @param  {number=}  maxplayers     The maximum amount of players.
 * @param  {string=}  peerserver     The peerserver hostname.
 * @param  {number=}  peerserverport The peerserver port.
 * @param  {string=}  serverName     The server name.
 * @param  {string=}  playerName     The name of the player.
 */
function startGame(isHost, token, maxplayers, peerserver, peerserverport, serverName, playerName) {
    game = document.getElementById('game');
    initStats();

    // create a scene, that will hold all our elements such as objects, cameras and lights.
    scene = new THREE.Scene();
    scene2 = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Various objects to help with the game.
    var container = document.getElementById('container');
    panel = new l3.html.Panel(container);
    hud = new l3.html.Hud(container);
    networker = new l3.main.Networking(isHost, token, maxplayers, peerserver, peerserverport, playerName);
    classSelect = new l3.html.ClassSelect(container, (isHost || token === undefined), serverName);
    animationListener = new l3.helpers.AnimationListener();
    objectHandler = new l3.helpers.ObjectHandler();
    cameraHelper = new l3.helpers.CameraHelper(camera);
    downloader = new l3.init.Downloader();
    collisionHelper = new l3.helpers.CollisionHelper(false);
    pointerLockHelper = new l3.helpers.PointerLockHelper();
    control = new l3.main.Control(game);
    particleHandler = new l3.helpers.ParticleHandler();

    downloader.get('music').play();

    // Start the game once all materials and objects are download.
    downloader.readyCallback = function() {
        // The world everything revolves around.
        downloader.get('planetSkin').mapping = THREE.SphericalReflectionMapping;
        world = new THREE.Mesh(new THREE.SphereGeometry(20, 32, 32), new THREE.MeshBasicMaterial({ 'map': downloader.get('planetSkin') }));
        world.orbit = 22;
        scene.add(world);
        var geometry = new THREE.Geometry();
        for (var i=0; i<200; i++) {
            geometry.vertices[i] = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize().multiplyScalar(60);
        }
        var stars = new THREE.PointCloud(geometry, new THREE.PointCloudMaterial({ 'size': 10 * particleFactor, 'blending': THREE.AdditiveBlending, 'transparent': true, 'color': 0xffffff,  'map': downloader.get('particle') }));
        world.add(stars);
        cameraHelper.setUp();

        // Draw the world's x, y and z axis in debug mode.
        if (debug === true) {
            var createAxis = function(p1, p2, color) {
                var line, lineGeometry = new THREE.Geometry(),
                lineMat = new THREE.LineBasicMaterial({ color: color });
                lineGeometry.vertices.push(p1, p2);
                line = new THREE.Line(lineGeometry, lineMat);
                scene.add(line);
            }

            createAxis(new THREE.Vector3(-400, 0, 0), new THREE.Vector3(400, 0, 0), 0xff0000);
            createAxis(new THREE.Vector3(0, -400, 0), new THREE.Vector3(0, 400, 0), 0x00ff00);
            createAxis(new THREE.Vector3(0, 0, -400), new THREE.Vector3(0, 0, 400), 0x0000ff);
        }

        if (networker.isHost === true || networker.token === undefined) {
            classSelect.show();
        }
    };

    // create a render and set the size
    webGLRenderer = new THREE.WebGLRenderer();
    webGLRenderer.setSize(window.innerWidth, window.innerHeight);
    webGLRenderer.shadowMapEnabled = false;
    webGLRenderer.autoClear = false;

    window.addEventListener('resize', function(e) {
        // notify the renderer of the size change
        webGLRenderer.setSize(window.innerWidth, window.innerHeight);
        // update the camera
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    // add spotlight for the shadows
    spotLight = new THREE.SpotLight(0xdddddd);
    spotLight.position.set(100, 100, 0);
    spotLight.intensity = 1;
    scene.add(spotLight);

    light = new THREE.AmbientLight( 0xaaaaaa ); // soft white light
    scene.add(light);

    // add the output of the renderer to the html element
    game.appendChild(webGLRenderer.domElement);

    clock = new THREE.Clock();
    render();
}

// Export this function so the game can be launched in angular.
window['startGame'] = startGame;

var totalDelta = 0;
var totalDelta2 = 0;
var time = 0;
function render() {
    var delta = clock.getDelta();

    // Update the progressbar
    if (networker.connected === false) {
        panel.updateProgress(panel.progress + delta*20);
    }

    if (downloader.ready) {
        THREE.AnimationHandler.update(delta);
        objectHandler.update(delta);

        control.update();
        particleHandler.update();
        animationListener.update();
        cameraHelper.update(delta);

        totalDelta += delta;
        if (totalDelta >= 0.04 && myself !== undefined) {
            totalDelta = 0;
            players[myself].rotation = control.pointerX;
            if (pointerLockHelper.locked === true) {
                control.pointerX = 0;
            }
            networker.serializeState();
        }

        totalDelta2 += delta;
        if (totalDelta2 >= 1) {
            totalDelta2 = 0;
            hud.updateTime(time);
            if (networker.isHost === true) {
                networker.sendQuickUpdate();
            }
        }
    }

    // render using requestAnimationFrame
    requestAnimationFrame(render);
    webGLRenderer.clear();
    webGLRenderer.render(scene, camera);
    webGLRenderer.clearDepth();
    webGLRenderer.render(scene2, camera);

    stats.update();
    time += delta;
}

function initStats() {
    stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms

    document.body.appendChild(stats.domElement);
}

/**
 * Spawns a hero for each player. This assumes no players exist at the time this function runs.
 */
function gameStart() {
    time = 0;

    // The host
    l3.init.PlayerFactory.Wizard(new THREE.Vector3(0, 0, world.orbit-1.5));
    myself = 0;
    cameraHelper.setUp();

    var amount = networker.token === undefined ? 15 : 5;
    for (var i=0; i<amount; i++) {
        var asteroid = l3.init.PlayerFactory.Asteroid(new THREE.Vector3(0, 0, world.orbit));
        asteroid.pivot2.rotation.x = Math.random()*Math.PI*2;
        asteroid.pivot2.rotation.y = Math.random()*Math.PI*2;
        asteroid.pivot2.rotation.z = Math.random()*Math.PI*2;

        if (debug === true) {
            var hitbox = new THREE.Mesh(new THREE.SphereGeometry(2), new THREE.MeshBasicMaterial({ 'color': 0x0000ff, 'wireframe': true }));
            hitbox.position.z = world.orbit;
            asteroid.pivot.add(hitbox);
        }
    }

    if (networker.token === undefined) {
        hud.updateTargets(amount);
    } else {
        hud.updateTargets(networker.peers.length);
    }

    // Clients
    for (var i in networker.peers) {
        var player = l3.init.PlayerFactory.Wizard(new THREE.Vector3(0, 0, world.orbit-1.5));
        player.pivot2.rotation.x = (i+1)/(networker.peers.length+1) * Math.PI * 2;
        player.pivot2.updateMatrix();

        networker.peers[i].peerId = players.indexOf(player);
    }

    // Make sure no one collides
    do {
        scene.updateMatrixWorld();
        for (var i in objectHandler.objects) {
            objectHandler.objects[i].worldposition.setFromMatrixPosition(objectHandler.objects[i].model.matrixWorld);
        }

        var badasteroids = [];
        for (var i in asteroids) {
            for (var j in players) {
                if (players[j].worldposition.distanceTo(asteroids[i].worldposition) < 6) {
                    badasteroids.push(asteroids[i]);
                }
            }
        }

        for (var i in badasteroids) {
            badasteroids[i].pivot2.rotation.x = Math.random()*Math.PI*2;
            badasteroids[i].pivot2.rotation.y = Math.random()*Math.PI*2;
            badasteroids[i].pivot2.rotation.z = Math.random()*Math.PI*2;
        }
    } while(badasteroids.length !== 0);

    for (var i in networker.peers) {
        networker.sendFullUpdate(networker.peers[i]);
    }
}

/**
 * Removes all objects from the game.
 */
function gameEnd() {
    for (var i=objectHandler.objects.length-1; i>=0; i--) {
        objectHandler.removeAt(i);
    }

    for (var i in particleHandler.system.children) {
        particleHandler.system.children[i].system.remove();
    }

    myself = undefined;
    cameraHelper.setUp();
    hud.select(1);

    // Also tell the clients
    if (networker.isHost === true) {
        networker.broadcast({'a': l3.main.Networking.States.RESET});
        for (var i in networker.peers) {
            networker.peers[i].peerId = undefined;
        }
    }

    // Reset scores
    classSelect.playersKilled = 0;
    classSelect.asteroidsKilled = 0;
    classSelect.won = undefined;
}

/**
 * Shows the class select menu.
 */
function showClassSelect() {
    if (classSelect !== undefined) {
        classSelect.show();
    }
}
window['showClassSelect'] = showClassSelect;

function enableDebug() {
    debug = true;
    gameEnd();

    for (var i = scene.children-1; i>=0; i--) {
        scene.remove(scene.children[i]);
    }
    for (var i = scene2.children-1; i>=0; i--) {
        scene2.remove(scene2.children[i]);
    }
    downloader.readyCallback();
}
window['debug'] = enableDebug;
