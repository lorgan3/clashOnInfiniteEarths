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

    // Select a new ability on mobile devices.
    hud.panel.addEventListener('touchstart', function(e) {
        if (e.target !== undefined) {
            hud.select(e.target.index);
            self.clicks[l3.main.Control.Mouse.RIGHT] = true;
        }

        e.preventDefault();
        e.stopPropagation();
        return false;
    });
    hud.panel.addEventListener('touchend', function(e) {
        if (e.target !== undefined) {
            hud.select(e.target.index);
            self.clicks[l3.main.Control.Mouse.RIGHT] = false;
        }

        e.preventDefault();
        e.stopPropagation();
        return false;
    });

    // Select a new ability on desktop.
    document.addEventListener('wheel', function(e) {
        hud.select(hud.selected + (e.wheelDelta < 0 ? 1 : -1));
    });

    // Execute ability on mobile.
    /*hud.triggerArea.addEventListener('touchstart', function(e) {
        self.clicks[l3.main.Control.Mouse.RIGHT] = true;

        e.preventDefault();
        e.stopPropagation();
        return false;
    });
    hud.triggerArea.addEventListener('touchend', function(e) {
        self.clicks[l3.main.Control.Mouse.RIGHT] = false;

        e.preventDefault();
        e.stopPropagation();
        return false;
    });*/

    // Execute ability on desktop.
    game.addEventListener('mousedown', function(e) {
        if (panel.hidden === false || classSelect.hidden === false) {
            return;
        }

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

    // Show scoreboard.
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
        } else if (e.keyCode === 49) {
            hud.select(1);
        } else if (e.keyCode === 50) {
            hud.select(2);
        } else if (e.keyCode === 51) {
            hud.select(3);
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
    players[myself].attack = this.clicks[l3.main.Control.Mouse.RIGHT] || this.clicks[l3.main.Control.Mouse.LEFT];
};
