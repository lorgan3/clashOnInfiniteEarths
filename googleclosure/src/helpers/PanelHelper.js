goog.provide('l3.helpers.PanelHelper');

/**
 * Creates a pure HTML panel that can display messages.
 * @constructor
 * @param {HTMLElement} container The element to add this panel to.
 */
l3.helpers.PanelHelper = function(container) {
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

    /**
     * The progressbar count
     * @type {number|undefined}
     */
    this.progress = 0;
};

/**
 * An enum that describes the panelstyles.
 * @enum {string}
 */
l3.helpers.PanelHelper.types = {
    PRIMARY: 'primary',
    SUCCESS: 'success',
    INFO: 'info',
    WARNING: 'warning',
    DANGER: 'danger'
}

/**
 * Sets the panel content
 * @param {l3.helpers.PanelHelper.types} type     The panel type.
 * @param {string}                       title    The panel title. Not for user input!.
 * @param {string}                       content  The panel content. Not for user input!
 * @param {number=}                      progress The progress in the progressbar.
 * @param {boolean=}                     critical Should there be a button to exit the game?
 */
l3.helpers.PanelHelper.prototype.set = function(type, title, content, progress, critical) {
    this.panel.style.display = 'block';
    this.panel.className = 'panel panel-' + type;

    this.panel.headTitle.textContent = title;
    this.panel.message.textContent = content;

    this.progress = progress;
    if (progress === undefined) {
        this.panel.progress.style.display = 'none';
    } else {
        this.panel.progress.style.display = 'block';
        this.updateProgress(progress);
    }

    if (critical === true) {
        this.panel.backButton.style.display = 'inline-block';
    }
};

/**
 * Updates the progressbar amount. The panel will be hidden when the progress is set to 100!
 * @param  {number=} progress The progress count.
 */
l3.helpers.PanelHelper.prototype.updateProgress = function(progress) {
    if (this.progress === undefined || progress === undefined) {
        return
    }

    this.progress = progress;
    if (progress >= 100) {
        this.hide();
    } else {
        this.panel.progressBar.style.width = Math.floor(progress) + '%';
    }
};

/**
 * Hides the panel.
 */
l3.helpers.PanelHelper.prototype.hide = function() {
    this.panel.style.display = 'none';
};
