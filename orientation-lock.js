// Try to lock the screen to landscape mode
function lockScreenToLandscape() {
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock("landscape").catch(function (error) {
      console.log("Screen orientation lock failed: ", error);
    });
  }
}

// Handle orientation changes
window.addEventListener("orientationchange", function () {
  lockScreenToLandscape();
});

// Initial call to lock orientation
document.addEventListener("DOMContentLoaded", function () {
  lockScreenToLandscape();
});
