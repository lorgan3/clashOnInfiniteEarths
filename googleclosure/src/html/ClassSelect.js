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

    if (serverName !== undefined) {
        serverName = 'Server: ' + serverName;
    } else {
        serverName = 'Single player';
    }
    this.panel.headTitle.appendChild(document.createTextNode(serverName));
    this.panel.body = document.createElement('div');
    this.panel.body.className = 'panel-body';
    this.makeTable();
    this.panel.message = document.createElement('div');

    if (isHost === true) {
        this.panel.backButton = document.createElement('a');
        this.panel.backButton.className = 'btn btn-default';
        this.panel.backButton.onclick = function() {
            gameEnd();
            gameStart();
            classSelect.hide();
            classSelect.hideMessage();
            pointerLockHelper.lock(game);
        };
        this.panel.backButton.textContent = 'start game';
        this.panel.backButton.style.display = 'inline-block';
        this.panel.message.appendChild(this.panel.backButton);
    } else {
        this.panel.hostMessage = document.createElement('p');
        this.panel.hostMessage.appendChild(document.createTextNode('Waiting for the host to start the server...'));
        this.panel.message.appendChild(this.panel.hostMessage);
    }

    this.panel.body.appendChild(this.panel.playerTable);
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
};

/**
 * Shows the panel.
 */
l3.html.ClassSelect.prototype.show = function() {
    this.panel.style.display = 'block';
    this.hidden = false;

    if (players.length === 0) {
        pointerLockHelper.unlock();
        this.showMessage();
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

/**
 * Redraws the playertable.
 */
l3.html.ClassSelect.prototype.update = function() {
    this.panel.body.removeChild(this.panel.playerTable);
    this.makeTable();
    this.panel.body.appendChild(this.panel.playerTable);
};

/**
 * Adds a player to the scoreboard.
 * @param {Object} player The player to add.
 */
l3.html.ClassSelect.prototype.addPlayer = function(player) {
    var i = this.panel.playerTable.players.length;
    var row = document.createElement('tr');
    this.panel.playerTable.players[i] = [];
    for(var j in this.headers) {
        var col = document.createElement('td');
        col.appendChild(document.createTextNode(player[this.headers[j]]));
        row.appendChild(col);
        this.panel.playerTable.players[i][this.headers[j]] = col;
    }
    this.panel.playerTable.appendChild(row);
};

/**
 * Removes a player from the scoreboard.
 * @param {Object} player The player to remove.
 */
l3.html.ClassSelect.prototype.removePlayer = function(player) {
    var row = this.findPlayer(player);
    if (row !== undefined) {
        this.panel.playerTable.removeChild(this.panel.playerTable.players[row][this.headers[0]].parentNode);
        delete this.panel.playerTable.players[row];
    }
};

/**
 * Updates the columns in a player row.
 * @param {Object} player The player.
 * @param {Object} values The new values.
 */
l3.html.ClassSelect.prototype.updatePlayer = function(player, values) {
    var row = this.findPlayer(player);
    if (row !== undefined) {
        var element = this.panel.playerTable.players[row];
        for (var j in this.headers) {
            if (values[this.headers[j]] !== undefined) {
                player[this.headers[j]] = values[this.headers[j]];
                element[this.headers[j]].innerHTML = '';
                element[this.headers[j]].appendChild(document.createTextNode(values[this.headers[j]]));
            }
        }
    }
}

/**
 * Looks for a player in the playertable.
 * @param  {Object}           player The player object.
 * @return {number|undefined}        The index
 */
l3.html.ClassSelect.prototype.findPlayer = function(player) {
    for (var i in this.panel.playerTable.players) {
        var found = true;
        for (var j in this.headers) {
            if (this.panel.playerTable.players[i][this.headers[j]].textContent !== String(player[this.headers[j]])) {
                found = false;
                break;
            }
        }

        if (found === true) {
            return Number(i);
        }
    }
    return undefined;
};

/**
 * Generates the html for the playertable.
 */
l3.html.ClassSelect.prototype.makeTable = function() {
    this.panel.playerTable = document.createElement('table');
    this.panel.playerTable.className = 'player-table';
    this.panel.playerTable.players = [];

    var row = document.createElement('tr');
    for(var i in this.headers) {
        var col = document.createElement('th');
        col.appendChild(document.createTextNode(this.headers[i]));
        row.appendChild(col);
    }
    this.panel.playerTable.appendChild(row);

    /*var playerData = [{name:'player1', kills:'1', deaths:'0'}, {name:'player2', kills:'0', deaths:'1'}];
    for(var i in playerData) {
        row = document.createElement('tr');
        this.panel.playerTable.players[+i] = [];
        for(var j in headers) {
            var col = document.createElement('td');
            col.appendChild(document.createTextNode(playerData[i][headers[j]]));
            row.appendChild(col);
            this.panel.playerTable.players[+i][headers[j]] = col;
        }
        this.panel.playerTable.appendChild(row);
    }*/
};