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
    this.panel.message = document.createElement('div');
    this.panel.progress = document.createElement('div');
    this.panel.progress.className = 'progress';
    this.panel.progressBar = document.createElement('div');
    this.panel.progressBar.className = 'progress-bar progress-bar-striped active'
    this.panel.progressBar.style.width = '0%';
    this.panel.backButton = document.createElement('a');
    this.panel.backButton.className = 'btn btn-default';
    this.panel.backButton.href = '#/';
    this.panel.backButton.textContent = 'Leave game';
    this.panel.backButton.style.display = 'none';

    this.panel.progress.appendChild(this.panel.progressBar);
    this.panel.body.appendChild(this.panel.message);
    this.panel.body.appendChild(this.panel.progress);
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
