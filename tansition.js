// Function to handle smooth screen transitions
function transitionToView(currentViewId, nextViewId, callback) {
  const currentView = document.getElementById(currentViewId);
  const nextView = document.getElementById(nextViewId);

  if (!currentView || !nextView) return;

  // 1. Play exit animation on current view
  currentView.classList.remove('view-enter');
  currentView.classList.add('view-exit');

  // 2. Wait for exit animation to finish (200ms)
  setTimeout(() => {
    currentView.classList.add('hidden');
    currentView.classList.remove('view-exit');

    // Execute card data population logic if provided
    if (callback) callback();

    // 3. Show and animate in the next view
    nextView.classList.remove('hidden');
    nextView.classList.add('view-enter');
  }, 200);
}
