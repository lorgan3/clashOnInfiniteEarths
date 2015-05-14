goog.provide('l3.html.ClassSelect');

/**
 * Creates a pure HTML panel for selecting classes.
 * @constructor
 * @param {HTMLElement} container  The element to add this panel to.
 * @param {boolean}     isHost     Are you the host?
 * @param {string=}     serverName The name of the server you're playing on.
 */
l3.html.ClassSelect = function(container, isHost, serverName) {

    /**
     * The headers in the playertable.
     * @type {Array}
     */
    this.headers = ['name', 'kills', 'deaths'];

    /**
     * The panel to display messages.
     * @type {Element}
     */
    this.panel = document.createElement('div');
    this.panel.className = 'panel panel-info';
    this.panel.id = 'game-panel';
    this.panel.style.display = 'none';

    this.panel.head = document.createElement('div');
    this.panel.head.className = 'panel-heading';
    this.panel.headTitle = document.createElement('h3');
    this.panel.headTitle.className = 'panel-title';

    if (networker.token !== undefined) {
        serverName = 'Server' + (serverName !== undefined ? ': '+ serverName : '');
    } else {
        serverName = 'Single player';
    }
    this.panel.headTitle.appendChild(document.createTextNode(serverName));
    this.panel.body = document.createElement('div');
    this.panel.body.className = 'panel-body';

    this.panel.message = document.createElement('div');

    this.panel.tutorial = document.createElement('p');
    this.panel.tutorial.appendChild(document.createTextNode('Eliminate all targets by punching or shooting them!\nUse your speed boost to get out of dangerous situations and be wary of your cooldowns.\nAlso keep an eye on the clock because the asteroids won\'t keep going slow!'));
    this.panel.tutorial.className = 'tutorial';

    this.panel.statusMessage = document.createElement('p');
    this.panel.statusMessage.className = 'status-message';
    this.panel.message.appendChild(this.panel.statusMessage);

    if (isHost === true) {
        this.panel.backButton = document.createElement('a');
        this.panel.backButton.className = 'btn btn-default';
        this.panel.backButton.onclick = function() {
            if (players.length === 0 || classSelect.won !== undefined) {
                gameEnd();
                gameStart();
                classSelect.hide();
                classSelect.hideMessage();
                pointerLockHelper.lock(game);
                classSelect.panel.statusMessage.textContent = '';
            }
        };
        this.panel.backButton.textContent = 'start game';
        this.panel.backButton.style.display = 'inline-block';
        this.panel.message.appendChild(this.panel.backButton);
    } else {
        this.panel.hostMessage = document.createElement('p');
        this.panel.hostMessage.appendChild(document.createTextNode('Waiting for the host to start the server...'));
        this.panel.message.appendChild(this.panel.hostMessage);
    }

    this.panel.body.appendChild(this.panel.tutorial);
    this.panel.body.appendChild(this.panel.message);
    this.panel.head.appendChild(this.panel.headTitle);
    this.panel.appendChild(this.panel.head);
    this.panel.appendChild(this.panel.body);
    container.appendChild(this.panel);

    /**
     * Is the panel hidden?
     * @type {boolean}
     */
    this.hidden = true;

    /**
     * The amount of players you killed.
     * @type {number}
     */
    this.playersKilled = 0;

    /**
     * The amount of asteroids you destroyed.
     * @type {number}
     */
    this.asteroidsKilled = 0;

    /**
     * Did you win the round?
     * @type {boolean|undefined}
     */
    this.won = undefined;
};

/**
 * Shows the panel.
 */
l3.html.ClassSelect.prototype.show = function() {
    this.panel.style.display = 'block';
    this.hidden = false;

    if (/*(players.length === 1 && networker.token !== undefined) || players.length === 0*/this.won !== undefined) {
        pointerLockHelper.unlock();
        this.showMessage();

        this.panel.statusMessage.textContent = '';
        if (this.won !== undefined) {
            this.panel.statusMessage.appendChild(document.createTextNode('You ' + (this.won ? 'won' : 'lost') + '!'));
            //if (players.length === 1 && this.won !== true) {
            //    this.panel.statusMessage.appendChild(document.createTextNode(player.name + ' won the game.'));
            //}

            // Exposed ajax call for updating the score.
            window['app']['sendScore'](Math.round(time-2), this.playersKilled, this.asteroidsKilled, this.won ? 1 : 0, (networker.token === undefined) ? 1 : 0);
        }
    }
};

/**
 * Hides the panel.
 */
l3.html.ClassSelect.prototype.hide = function() {
    this.panel.style.display = 'none';
    this.hidden = true;
};

/**
 * Shows the message below the scoreboard.
 */
l3.html.ClassSelect.prototype.showMessage = function() {
    this.panel.message.style.display = 'block';
};

/**
 * Hides the message below the scoreboard.
 */
l3.html.ClassSelect.prototype.hideMessage = function() {
    this.panel.message.style.display = 'none';
};
