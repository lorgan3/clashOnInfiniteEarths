goog.provide('l3.main.Control');

/**
 * An object that keeps track of user input.
 *
 * @param {HTMLElement} game The game element to listen for input on.
 * @constructor
 */
l3.main.Control = function(game) {
	this.mouseX = 0;
	this.mouseY = 0;
	this.mouseWheel = 0;
	this.keys = [];
	this.listeners = [];

	var self = this;
	var move = document.getElementById('move');
	var attack = document.getElementById('attack')

	game.addEventListener('keydown', function(e) {
		self.keys[e.keyCode] = true;
	});
	game.addEventListener('keyup', function(e) {
		self.keys[e.keyCode] = false;
	});
	game.addEventListener('mousemove', function(e) {
		self.mouseX =  e['movementX'] || e['mozMovementX'] || e['webkitMovementX'] || 0;
		self.mouseY = e['movementY'] || e['mozMovementY'] || e['webkitMovementY'] || 0;

		/*self.mouseX = e.pageX;
		self.mouseY = e.pageY;*/
	});
	game.addEventListener('touchmove', function(e) {
		var touch = e.changedTouches[0];
		self.mouseX = touch.pageX;
		self.mouseY = touch.pageY;
	});

	move.addEventListener('touchstart', function(e) {
		self.keys[l3.main.Control.Mouse.LEFT] = true;

		e.preventDefault();
		e.stopPropagation();
		return false;
	});
	move.addEventListener('touchend', function(e) {
		self.keys[l3.main.Control.Mouse.LEFT] = false;

		e.preventDefault();
		e.stopPropagation();
		return false;
	});

	attack.addEventListener('touchstart', function(e) {
		self.keys[l3.main.Control.Mouse.RIGHT] = true;

		e.preventDefault();
		e.stopPropagation();
		return false;
	});
	attack.addEventListener('touchend', function(e) {
		self.keys[l3.main.Control.Mouse.RIGHT] = false;

		e.preventDefault();
		e.stopPropagation();
		return false;
	});

	game.addEventListener('mousedown', function(e) {
		if (pointerLockHelper.locked === false) {
			pointerLockHelper.lock(game);
		}

		switch(e.which) {
			case 1: // left
				self.keys[l3.main.Control.Mouse.LEFT] = true;
			break;
			case 2: // middle
				self.keys[l3.main.Control.Mouse.MIDDLE] = true;
			break;
			case 3: // right
				self.keys[l3.main.Control.Mouse.RIGHT] = true;
			break;
		}

		e.preventDefault();
		e.stopPropagation();
		return false;
	});
	game.addEventListener('mouseup', function(e) {
		switch(e.which) {
			case 1: // left
				self.keys[l3.main.Control.Mouse.LEFT] = false;
			break;
			case 2: // middle
				self.keys[l3.main.Control.Mouse.MIDDLE] = false;
			break;
			case 3: // right
				self.keys[l3.main.Control.Mouse.RIGHT] = false;
			break;
		}

		e.preventDefault();
		e.stopPropagation();
		return false;
	});

	game.addEventListener('mousewheel', function(e) {
		self.mouseWheel = e.wheelDelta;
	})

	// Prevent the right click context menu.
	document.addEventListener('contextmenu', function(e) {
		e.preventDefault();
	});
};

/**
 * Mouse buttons.
 * @enum {number}
 */
l3.main.Control.Mouse = {
	LEFT: -1,
	MIDDLE: -2,
	RIGHT: -3
}

/**
 * Executes the callback every frame that the key is pressed.
 * @param  {number}   key      The key that the function is linked to.
 * @param  {Function} callback The callback.
 */
l3.main.Control.prototype.on = function(key, callback) {
	if (this.listeners[key] === undefined) {
		this.listeners[key] = [];
	}

	this.listeners[key].push(callback);
};

/**
 * Checks all keys.
 */
l3.main.Control.prototype.update = function() {
	if (myself === undefined) {
		return;
	}

	players[myself].mouseX = this.mouseX;
	this.mouseX = 0;
	players[myself].move = this.keys[l3.main.Control.Mouse.LEFT];
	//players[myself].attack = this.keys[l3.main.Control.Mouse.RIGHT];
	//players[myself].scroll = this.mouseWheel > 0 ? 1 : this.mouseWheel < 0 ? -1: 0;
	//players[myself].rotation = Math.atan2(window.innerWidth/2 - this.mouseX, window.innerHeight/2 - this.mouseY);

	this.mouseWheel = 0;
};
