function transitionToView(currentViewId, nextViewId, callback) {
  const currentView = document.getElementById(currentViewId);
  const nextView = document.getElementById(nextViewId);

  if (!currentView || !nextView) return;

  // 1. Play exit animation on current view
  currentView.classList.remove('view-enter');
  currentView.classList.add('view-exit');

  // 2. Wait 200ms for exit animation to complete
  setTimeout(() => {
    currentView.classList.add('hidden');
    currentView.classList.remove('view-exit');

    if (callback) callback();

    // 3. Bring in next view
    nextView.classList.remove('hidden');
    nextView.classList.add('view-enter');
  }, 200);
}
