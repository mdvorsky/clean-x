function hideIndividualElement(element) {
  if (element && element.style.display !== 'none') {
    element.style.display = 'none';
  }
}

function removeForYouTab() {
  // X.com changed their DOM structure - tabs are now div[role="tab"] elements
  // inside a div[role="presentation"] wrapper, with the tab name in a span child
  const tabs = document.querySelectorAll('div[role="tab"]');

  for (const tab of tabs) {
    const spanElement = tab.querySelector('span');
    if (spanElement && spanElement.textContent.trim() === 'For you') {
      // Hide the presentation wrapper (parent of the tab)
      hideIndividualElement(tab.parentElement);
    }
  }
}

// Track if we've already clicked Following for this navigation
let hasClickedFollowing = false;
let lastPath = '';

function clickFollowingTab() {
  // Only run on home page
  const path = window.location.pathname;
  if (path !== '/' && path !== '/home' && !path.startsWith('/home')) {
    return;
  }

  // Reset flag if we navigated to a new page
  if (path !== lastPath) {
    hasClickedFollowing = false;
    lastPath = path;
  }

  // Don't try again if we've already clicked
  if (hasClickedFollowing) {
    return;
  }

  const tabs = document.querySelectorAll('div[role="tab"]');

  for (const tab of tabs) {
    const spanElement = tab.querySelector('span');
    if (spanElement && spanElement.textContent.trim() === 'Following') {
      // Only click if not already selected
      if (tab.getAttribute('aria-selected') !== 'true') {
        tab.click();
        hasClickedFollowing = true;
      } else {
        // Already on Following, mark as done
        hasClickedFollowing = true;
      }
      return;
    }
  }
}

function removeExploreButton() {
  const exploreLinks = document.querySelectorAll('a[href="/explore"]');

  for (const exploreLink of exploreLinks) {
    hideIndividualElement(exploreLink);
  }
}

function removeTrendingNowTimeline() {
  const trendingTimeline = document.querySelector('div[aria-label="Timeline: Trending now"]');

  if (trendingTimeline) {
    hideIndividualElement(trendingTimeline);
  }
}

// Sidebar sections to hide - add new titles here
const SIDEBAR_SECTIONS_TO_HIDE = [
  "Today's News",
  "Who to follow",
  "What's happening",
  "Subscribe to Premium",
];

function removeSidebarSections() {
  const allSpans = document.querySelectorAll('span');
  
  for (const span of allSpans) {
    // Only target the right sidebar column to avoid hiding main content
    const sidebarColumn = span.closest('div[data-testid="sidebarColumn"]');
    if (!sidebarColumn) {
      continue;
    }

    const text = span.textContent.trim();
    
    // Check if this span matches any section we want to hide
    const shouldHide = SIDEBAR_SECTIONS_TO_HIDE.some(section => {
      // Handle apostrophe variations by checking if text contains all words
      const words = section.split(/['\s]+/).filter(word => word.length > 1);
      return words.every(word => text.includes(word));
    });
    
    if (shouldHide) {
      // Prefer hiding the module section, fallback to a few parents
      let container = span.closest('section');
      if (!container) {
        container = span.parentElement;
        for (let i = 0; i < 4 && container; i++) {
          container = container.parentElement;
        }
      }
      if (container) {
        hideIndividualElement(container);
      }
    }
  }
}

function hideElements() {
  removeForYouTab();
  clickFollowingTab();
  removeExploreButton();
  removeTrendingNowTimeline();
  removeSidebarSections();
}

// Run the functions to remove the elements
hideElements();

// X.com is a dynamic single-page application (SPA).
// New content (including tabs) can be loaded or re-rendered without a full page reload.
// A MutationObserver is a robust way to detect these changes.
const observer = new MutationObserver((mutationsList, observer) => {
  // We could check mutationsList for specific changes, but for simplicity,
  // we'll just re-run the removal functions.
  hideElements();
});

// Start observing the document body for configured mutations
observer.observe(document.body, {
  childList: true, // Listen for addition or removal of child nodes
  subtree: true    // Observe all descendants of document.body
});
