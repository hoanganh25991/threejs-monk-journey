import {SimulatedLoadingScreen} from "./SimulatedLoadingScreen.js"

/**
 * initial-loading-progress.js
 * Simulated loading progress that increases by 1% every 100ms
 * Provides a visual loading indicator for the initial application load
 */

// Immediately create an instance when the script is loaded
(function () {
  if (window.game){
    return;
  }
  new SimulatedLoadingScreen(100, 1).start();
})();
