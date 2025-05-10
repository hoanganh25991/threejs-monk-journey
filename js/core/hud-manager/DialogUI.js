import { UIComponent } from '../UIComponent.js';

/**
 * Dialog UI component
 * Displays dialog boxes with text and continue button
 */
export class DialogUI extends UIComponent {
    /**
     * Create a new DialogUI component
     * @param {Object} game - Reference to the game instance
     */
    constructor(game) {
        super('dialog-box', game);
        this.dialogText = null;
        this.dialogContinue = null;
        this.isDialogOpen = false;
    }
    
    /**
     * Initialize the component
     * @returns {boolean} - True if initialization was successful
     */
    init() {
        const template = `
            <div id="dialog-text"></div>
            <div id="dialog-continue">Click to continue...</div>
        `;
        
        // Render the template
        this.render(template);
        
        // Store references to elements we need to update
        this.dialogText = document.getElementById('dialog-text');
        this.dialogContinue = document.getElementById('dialog-continue');
        
        // Add click event to close dialog
        this.container.addEventListener('click', () => {
            this.hideDialog();
        });
        
        // Hide initially
        this.hide();
        
        return true;
    }
    
    /**
     * Show a dialog with title and text
     * @param {string} title - Dialog title
     * @param {string} text - Dialog text
     */
    showDialog(title, text) {
        // Update dialog text
        this.dialogText.innerHTML = `<h3>${title}</h3><p>${text}</p>`;
        
        // Show dialog box
        this.show();
        this.isDialogOpen = true;
        
        // Make sure the dialog is visible and properly positioned
        this.container.style.display = 'block';
        this.container.style.zIndex = '1000'; // Ensure it's above other elements
        
        // Add a visual indicator that clicking will close the dialog
        this.dialogContinue.style.display = 'block';
        
        // Pause game
        this.game.pause();
        
        console.log('Dialog opened:', title);
    }
    
    /**
     * Hide the dialog
     */
    hideDialog() {
        // Hide dialog box
        this.hide();
        this.isDialogOpen = false;
        
        // Ensure the container is hidden
        this.container.style.display = 'none';
        
        // Resume game
        this.game.resume();
        
        console.log('Dialog closed');
    }
}