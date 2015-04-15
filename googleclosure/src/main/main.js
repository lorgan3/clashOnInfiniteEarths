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
goog.require('l3.helpers.PanelHelper');

goog.require('l3.helpers.PointerLockHelper');

var stats, myself, world;
var players = [];
var enemies = [];

/**
 * Show debug information?
 *
 * @const
 * @type {boolean}
 */
var debug = true;

var scene, camera, animationListener, particleHandler, objectHandler, cameraHelper, scene2, game, panelHelper,
    networker, downloader, collisionHelper, pointerLockHelper, control, webGLRenderer, spotLight, light, clock;

/**
 * Starts the game.
 * @param  {boolean}  isHost         Are you the host?
 * @param  {string=}  token          The peer token.
 * @param  {number=}  maxplayers     The maximum amount of players.
 * @param  {string=}  peerserver     The peerserver hostname.
 * @param  {number=}  peerserverport The peerserver port.
 */
function startGame(isHost, token, maxplayers, peerserver, peerserverport) {
    game = document.getElementById('game');
    initStats();

    // create a scene, that will hold all our elements such as objects, cameras and lights.
    scene = new THREE.Scene();
    scene2 = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.rotation.x = -1.35;
    console.log(camera);

    // Various objects to help with the game.
    panelHelper = new l3.helpers.PanelHelper(document.getElementById('container'));
    animationListener = new l3.helpers.AnimationListener();
    objectHandler = new l3.helpers.ObjectHandler();
    cameraHelper = new l3.helpers.CameraHelper(camera, new THREE.Vector3(0, 40, 5));
    networker = new l3.main.Networking(isHost, token, maxplayers, peerserver, peerserverport);
    downloader = new l3.init.Downloader();
    collisionHelper = new l3.helpers.CollisionHelper(false);
    pointerLockHelper = new l3.helpers.PointerLockHelper();
    control = new l3.main.Control(game);

    // Start the game once all materials and objects are download.
    downloader.readyCallback = function() {
        // The world everything revolves around.
        world = downloader.addClone('planet', new THREE.Vector3(0, 0, 0), new THREE.Euler(0, Math.PI/2, 0, 'XYZ'));
        world.material.materials[0].map = downloader.get('planetSkin');
        scene.add(world);

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
            var player = l3.init.PlayerFactory.Wizard(new THREE.Vector3(0, 0, 25));
            objectHandler.add(player);

            // Randomize
            player.pivot2.rotation.x = Math.random() * Math.PI * 2;
            player.pivot2.rotation.y = Math.random() * Math.PI * 2;
            player.pivot2.rotation.z = Math.random() * Math.PI * 2;

            myself = 0;
            players[myself].model.add(camera);
        }
    };

    // create a render and set the size
    webGLRenderer = new THREE.WebGLRenderer();
    webGLRenderer.setClearColor(new THREE.Color(0x999999, 1.0));
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
    spotLight.intensity = 1.5;
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
function render() {
    var delta = clock.getDelta();

    // Update the progressbar
    if (networker.connected === false) {
        panelHelper.updateProgress(panelHelper.progress + delta*20);
    }

    if (downloader.ready) {
        THREE.AnimationHandler.update(delta);
        objectHandler.update(delta);

        control.update();
        cameraHelper.update();
        if (particleHandler !== undefined) {
            particleHandler.update();
        }
        animationListener.update();

        totalDelta += delta;
        if (totalDelta >= 0.05 && myself !== undefined) {
            totalDelta = 0;
            players[myself].rotation = control.mouseX;
            control.mouseX = 0;
            networker.serializeState();
        }

        totalDelta2 += delta;
        if (totalDelta2 >= 1 && networker.isHost === true) {
            totalDelta2 = 0;
            /*for(var i in enemies) {
                enemies[i].aiUpdate();
            }*/
            networker.sendQuickUpdate();
        }
    }


    // render using requestAnimationFrame
    requestAnimationFrame(render);

    webGLRenderer.clear();
    webGLRenderer.render(scene, camera);
    //webGLRenderer.clearDepth();
    //webGLRenderer.render(scene2, camera);

    stats.update();
}

function initStats() {
    stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms

    document.body.appendChild(stats.domElement);
}
