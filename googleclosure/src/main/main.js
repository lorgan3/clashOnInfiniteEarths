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

var stats, myself, world;
var players = [];
var enemies = [];
var colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];

var scene, camera, animationListener, particleHandler, objectHandler, cameraHelper,
    networker, downloader, collisionHelper, control, webGLRenderer, spotLight, light, clock;

/**
 * Starts the game
 */
function startGame() {
    initStats();

    // create a scene, that will hold all our elements such as objects, cameras and lights.
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    animationListener = new l3.helpers.AnimationListener();
    particleHandler = new l3.helpers.ParticleHandler();
    objectHandler = new l3.helpers.ObjectHandler();
    cameraHelper = new l3.helpers.CameraHelper(camera, new THREE.Vector3(0, 0, 40));
    networker = new l3.main.Networking();
    downloader = new l3.init.Downloader();
    collisionHelper = new l3.helpers.CollisionHelper(false);

    downloader.readyCallback = function() {
        var player = l3.init.PlayerFactory.Wizard(new THREE.Vector3(0, 0, 0));
        players.push(player);
        objectHandler.add(player);
        myself = 0;
        player.model.add(camera);

        world = downloader.addClone('planet', new THREE.Vector3(0, 0, 0), new THREE.Euler(0, Math.PI/2, 0, 'XYZ'), scene);
        world.material.materials[0].map = downloader.get('planetSkin');
    };

    control = new l3.main.Control();

    // create a render and set the size
    webGLRenderer = new THREE.WebGLRenderer();
    webGLRenderer.setClearColor(new THREE.Color(0x999999, 1.0));
    webGLRenderer.setSize(window.innerWidth, window.innerHeight);
    webGLRenderer.shadowMapEnabled = false;
    window.addEventListener('resize', function(e) {
        // notify the renderer of the size change
        webGLRenderer.setSize(window.innerWidth, window.innerHeight);
        // update the camera
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    // add spotlight for the shadows
    spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(100, 100, 0);
    spotLight.intensity = 1.5;
    scene.add(spotLight);

    light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add(light);

    // add the output of the renderer to the html element
    document.getElementById('game').appendChild(webGLRenderer.domElement);

    clock = new THREE.Clock();
    render();
}

// Export this function so the game can be launched in angular.
window['startGame'] = startGame;

var totalDelta = 0;
var totalDelta2 = 0;
function render() {
    var delta = clock.getDelta();
    if (downloader.ready) {
        THREE.AnimationHandler.update(delta);
        objectHandler.update(delta);

        control.update();
        cameraHelper.update();
        particleHandler.update();
        animationListener.update();

        totalDelta += delta;
        if (totalDelta >= 0.05) {
            totalDelta = 0;
            networker.serializeState();
        }

        totalDelta2 += delta;
        if (totalDelta2 >= 1 && networker.isHost === true) {
            totalDelta2 = 0;
            for(var i in enemies) {
                enemies[i].aiUpdate();
            }
            networker.sendQuickUpdate();
        }
    }


    // render using requestAnimationFrame
    requestAnimationFrame(render);
    webGLRenderer.render(scene, camera);
    stats.update();
}

function initStats() {
    stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms

    document.body.appendChild(stats.domElement);
}