goog.provide('l3.html.ClassSelect');

/**
 * Creates a pure HTML panel for selecting classes.
 * @constructor
 * @param {HTMLElement} container The element to add this panel to.
 */
l3.html.ClassSelect = function(container) {
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
    this.panel.body = document.createElement('div');
    this.panel.body.className = 'panel-body';
    this.makeTable();
    this.panel.message = document.createElement('div');
    this.panel.backButton = document.createElement('a');
    this.panel.backButton.className = 'btn btn-default';
    this.panel.backButton.onclick = function() {
        gameStart();
        classSelect.hide();
    };
    this.panel.backButton.textContent = 'start game';
    this.panel.backButton.style.display = 'inline-block';

    this.panel.body.appendChild(this.panel.message);
    this.panel.body.appendChild(this.panel.playerTable);
    this.panel.head.appendChild(this.panel.headTitle);
    this.panel.appendChild(this.panel.head);
    this.panel.appendChild(this.panel.body);
    this.panel.appendChild(this.panel.backButton);

    container.appendChild(this.panel);
};

/**
 * Shows the panel.
 */
l3.html.ClassSelect.prototype.show = function() {
    this.panel.style.display = 'block';
};

/**
 * Hides the panel.
 */
l3.html.ClassSelect.prototype.hide = function() {
    this.panel.style.display = 'none';
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
 * Generates the html for the playertable.
 */
l3.html.ClassSelect.prototype.makeTable = function() {
    this.panel.playerTable = document.createElement('table');
    this.panel.playerTable.className = 'player-table';
    var row = document.createElement('tr');
    var headers = ['name', 'kills', 'deaths'];
    for(var i in headers) {
        var col = document.createElement('th');
        col.appendChild(document.createTextNode(headers[i]));
        row.appendChild(col);
    }
    this.panel.playerTable.appendChild(row);

    var playerData = [{name:'player1', kills:'1', deaths:'0'}, {name:'player2', kills:'0', deaths:'1'}];
    for(var i in playerData) {
        row = document.createElement('tr');
        for(var j in headers) {
            var col = document.createElement('td');
            col.appendChild(document.createTextNode(playerData[i][headers[j]]));
            row.appendChild(col);
        }
        this.panel.playerTable.appendChild(row);
    }
};