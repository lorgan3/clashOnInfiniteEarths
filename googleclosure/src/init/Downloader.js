goog.provide('l3.init.Downloader');

/**
 * A downloader used to predownload all models
 * @constructor
 */
l3.init.Downloader = function() {
	this.loader = new THREE.JSONLoader();
	this.models = {};

	this.downloads = 0;
	this.totalDownloads = 0;
	this.readyCallback = undefined;
	this.ready = false;

	this.init();
};

/**
 * Download all the things!
 */
l3.init.Downloader.prototype.init = function() {
	this.loadImage('particle', 'img/particle.png');
	this.loadImage('smoke', 'img/smoke.png');
	this.loadImage('pow', 'img/pow.png');
	this.loadImage('planetSkin', 'img/earth.jpg');
	this.loadImage('hero1Skin', 'img/hero1.png');
	this.loadImage('asteroid1', 'img/asteroid1.png');
	this.loadImage('asteroid2', 'img/asteroid2.png');

	this.loadSound('punch', 'snd/punch.mp3');
	this.loadSound('swing', 'snd/swing.mp3');
	this.loadSound('crush', 'snd/crush.mp3');
	this.loadSound('scream', 'snd/scream.mp3');
	this.loadSound('stun', 'snd/stun.mp3');

	this.loadMesh('wizard', 'models/hero1.json');
	this.loadMesh('planet', 'models/planet.json');
	this.loadMesh('laser', 'models/laser.json');
};

/**
 * Start downloading a mesh.
 * @param  {string} name The key to get the downloaded model later.
 * @param  {string} url  path to download from.
 */
l3.init.Downloader.prototype.loadMesh = function(name, url) {
	this.totalDownloads++;
	var self = this;

	this.loader.load(url, function(geometry, mat) {
		self.models[name] = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(mat));

		self.downloads++;
		if (self.downloads === self.totalDownloads && self.readyCallback !== undefined) {
			self.ready = true;
			self.readyCallback();
		}
	});
};

/**
 * Download an image.
 * @param  {string} name The key to get the downloaded image later.
 * @param  {string} url  path to download from.
 */
l3.init.Downloader.prototype.loadImage = function(name, url) {
	this.models[name] = THREE.ImageUtils.loadTexture(url);
};

/**
 * Download a sound.
 * @param  {string} name The key to get the downloaded sound later.
 * @param  {string} url  path to download from.
 */
l3.init.Downloader.prototype.loadSound = function(name, url) {
	//this.models[name] = new Audio(url);
	this.models[name] = new Howl({ 'urls': [url] });
};

/**
 * Get a downloaded mesh.
 * @param  {string} name The mesh name.
 * @return {Object}      The downloaded mesh.
 */
l3.init.Downloader.prototype.get = function(name) {
	return this.models[name];
};

/**
 * Adds a clone of the selected mesh to the target.
 * @param  {string}  name     The mesh name
 * @param  {Object=} position The position of the mesh.
 * @param  {Object=} rotation The rotation of the mesh.
 * @param  {Object=} target   The target to add the clone to.
 * @return {Object}           The clone if no target was specified.
 */
l3.init.Downloader.prototype.addClone = function(name, position, rotation, target) {
	var mesh = this.get(name).clone();
	//mesh.scale.set(0.2,0.2,0.2);

    if (position !== undefined) {
        mesh.position.copy(position);
    }

    if (rotation !== undefined) {
        mesh.rotation.copy(rotation);
    }

    if (target !== undefined) {
    	target.add(mesh);
    }

    return mesh;
};
