goog.provide('l3.main.Control');

/**
 * An object that keeps track of user input.
 *
 * @param {HTMLElement} game The game element to listen for input on.
 * @constructor
 */
l3.main.Control = function(game) {
    this.pointerX = 0;
    this.pointerY = 0;
    this.clicks = [];

    var self = this;
    var move = document.getElementById('move');
    var attack = document.getElementById('attack')

    // HTML5 Pointer lock api to turn in normal devices.
    game.addEventListener('mousemove', function(e) {
        if (pointerLockHelper.locked === false) {
            // Fallback
            self.pointerX = (e.pageX - window.innerWidth/2)/80;
            self.pointerY = (e.pageY - window.innerHeight/2)/80;
        } else {
            self.pointerX +=  (e['movementX'] || e['mozMovementX'] || e['webkitMovementX'] || 0) % 50;
            self.pointerY += (e['movementY'] || e['mozMovementY'] || e['webkitMovementY'] || 0) % 50;
        }
    });

    // HTML5 device orientation to turn in mobile devices.
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', function(e) {
            // e.gamma (up/down), e.beta (rotate), e.alpha (left/right)
            self.pointerX = e.beta;
            self.pointerY = e.gamma;
        });
    }

    // Listeners for mouse clicks.
    move.addEventListener('touchstart', function(e) {
        self.clicks[l3.main.Control.Mouse.LEFT] = true;

        e.preventDefault();
        e.stopPropagation();
        return false;
    });
    move.addEventListener('touchend', function(e) {
        self.clicks[l3.main.Control.Mouse.LEFT] = false;

        e.preventDefault();
        e.stopPropagation();
        return false;
    });

    attack.addEventListener('touchstart', function(e) {
        self.clicks[l3.main.Control.Mouse.RIGHT] = true;

        e.preventDefault();
        e.stopPropagation();
        return false;
    });
    attack.addEventListener('touchend', function(e) {
        self.clicks[l3.main.Control.Mouse.RIGHT] = false;

        e.preventDefault();
        e.stopPropagation();
        return false;
    });

    game.addEventListener('mousedown', function(e) {
        // Lock the pointer
        if (pointerLockHelper.locked === false) {
            pointerLockHelper.lock(game);
        }

        switch(e.which) {
            case 1: // left
                self.clicks[l3.main.Control.Mouse.LEFT] = true;
            break;
            case 2: // middle
                self.clicks[l3.main.Control.Mouse.MIDDLE] = true;
            break;
            case 3: // right
                self.clicks[l3.main.Control.Mouse.RIGHT] = true;
            break;
        }

        e.preventDefault();
        e.stopPropagation();
        return false;
    });
    game.addEventListener('mouseup', function(e) {
        switch(e.which) {
            case 1: // left
                self.clicks[l3.main.Control.Mouse.LEFT] = false;
            break;
            case 2: // middle
                self.clicks[l3.main.Control.Mouse.MIDDLE] = false;
            break;
            case 3: // right
                self.clicks[l3.main.Control.Mouse.RIGHT] = false;
            break;
        }

        e.preventDefault();
        e.stopPropagation();
        return false;
    });

    // Prevent the right click context menu.
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    document.addEventListener('keydown', function(e) {
        if (e.keyCode === 9) {
            classSelect.show();

            e.stopPropagation();
            e.preventDefault();
            return false;
        }
    });
    document.addEventListener('keyup', function(e) {
        if (e.keyCode === 9) {
            classSelect.hide();
        }
    });
};

/**
 * Mouse buttons.
 * @enum {number}
 */
l3.main.Control.Mouse = {
    LEFT: 0,
    MIDDLE: 1,
    RIGHT: 2
}

/**
 * Sends the new control state to your character.
 */
l3.main.Control.prototype.update = function() {
    if (myself === undefined) {
        return;
    }

    // The rotation is set when the game sends a quick update.
    players[myself].move = this.clicks[l3.main.Control.Mouse.LEFT];
    players[myself].attack = this.clicks[l3.main.Control.Mouse.RIGHT];
};
