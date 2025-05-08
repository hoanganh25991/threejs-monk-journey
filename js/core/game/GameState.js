/**
 * Manages the game state (running, paused, etc.)
 */
export class GameState {
    constructor() {
        this._isPaused = true; // Game starts in paused state
    }
    
    /**
     * Check if the game is currently paused
     * @returns {boolean} True if the game is paused
     */
    isPaused() {
        return this._isPaused;
    }
    
    /**
     * Check if the game is currently running
     * @returns {boolean} True if the game is running
     */
    isRunning() {
        return !this._isPaused;
    }
    
    /**
     * Set the game to paused state
     */
    setPaused() {
        this._isPaused = true;
    }
    
    /**
     * Set the game to running state
     */
    setRunning() {
        this._isPaused = false;
    }
    
    /**
     * Toggle the game's pause state
     * @returns {boolean} The new pause state (true if paused)
     */
    togglePause() {
        this._isPaused = !this._isPaused;
        return this._isPaused;
    }
}