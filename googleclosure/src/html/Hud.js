goog.provide('l3.html.Hud');

/**
 * Creates a pure HTML panel for selecting classes.
 * @constructor
 * @param {HTMLElement} container  The element to add this panel to.
 */
l3.html.Hud = function(container) {
    /**
     * The panel to display messages.
     * @type {Element}
     */
    this.panel = document.createElement('div');
    this.panel.className = 'hud';
    this.panel.id = 'hud';
    this.panel.style.display = 'none';

    this.panel.time = document.createElement('div');
    this.panel.time.className = 'time';
    this.panel.time.textContent = '00:00';

    this.panel.laser = document.createElement('div');
    this.panel.laser.className = 'ability generating';
    this.panel.laser.id = 'laser';
    this.panel.laser.index = 0;

    this.panel.punch = document.createElement('div');
    this.panel.punch.className = 'ability generating selected';
    this.panel.punch.id = 'punch';
    this.panel.punch.index = 1;

    this.panel.speed = document.createElement('div');
    this.panel.speed.className = 'ability generating';
    this.panel.speed.id = 'speed';
    this.panel.speed.index = 2;

    this.panel.targets = document.createElement('div');
    this.panel.targets.className = 'targets';
    this.panel.targets.textContent = '0/0';

    this.panel.appendChild(this.panel.time);
    this.panel.appendChild(this.panel.laser);
    this.panel.appendChild(this.panel.punch);
    this.panel.appendChild(this.panel.speed);
    this.panel.appendChild(this.panel.targets);
    container.appendChild(this.panel);

    /**
     * A trigger area for mobile users.
     * @type {Element}
     */
    this.triggerArea = document.createElement('div');
    this.triggerArea.className = 'trigger';
    container.appendChild(this.triggerArea);

    /**
     * Shorthand for quickly selecting an ability.
     * @type {Array}
     */
    this.controls = [this.panel.laser, this.panel.punch, this.panel.speed];

    /**
     * The currently selected item.
     *
     * @type {number}
     */
    this.selected = 1;

    /**
     * The current amount of targets.
     * @type {number}
     */
    this.targets = 0;

    /**
     * The maximum amount of targets.
     * @type {number|undefined}
     */
    this.maxTargets = undefined;
};

/**
 * Shows the panel.
 */
l3.html.Hud.prototype.show = function() {
    this.panel.style.display = 'block';
};

/**
 * Hides the panel.
 */
l3.html.Hud.prototype.hide = function() {
    this.panel.style.display = 'none';
};

/**
 * Change the selected ability in the hud.
 * @param {number=} ability The new selected ability.
 */
l3.html.Hud.prototype.select = function(ability) {
    this.controls[this.selected].className = 'ability generating';
    if (ability === undefined) {
        this.selected = (this.selected + 1) % 3;
    } else {
        if (ability > 2) {
            ability -= 3;
        } else if (ability < 0) {
            ability += 3;
        }
        this.selected = ability;
    }

    this.controls[this.selected].className = 'ability generating selected';

    if (myself !== undefined) {
        players[myself].ability = this.selected;
    }
};

/**
 * Trigger the generating css transition for the current ability.
 */
l3.html.Hud.prototype.regenerate = function() {
    this.controls[this.selected].className = 'ability selected';

    var self = this;
    window.setTimeout(function() {
        self.controls[self.selected].className = 'ability generating selected';
    }, 17);
};

/**
 * Updates the timer on the hud.
 * @param {number} time The current game time in seconds.
 */
l3.html.Hud.prototype.updateTime = function(time) {
    var minutes = Math.floor((time / 60) % 60);
    var seconds = Math.floor(time % 60);

    this.panel.time.textContent = (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds  < 10 ? '0' + seconds : seconds);
};

/**
 * Updates the amount of targets on the hud.
 * @param {number|undefined} targets The current amount of targets.
 */
l3.html.Hud.prototype.updateTargets = function(targets) {
    if (targets === undefined) {
        this.targets--;
    } else {
        if (this.maxTargets === undefined) {
            this.maxTargets = targets;
        }
        this.targets = targets;
    }
    this.panel.targets.textContent = this.targets + '/' + this.maxTargets;
};