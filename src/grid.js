/* =================================================================
   GRID PORTFOLIO JS - Navigation, zoom, and event handling
   ================================================================= */

// State management
let pos_x = 0;
let pos_y = 0;
let isZoomMode = false;

const siteWrap = document.getElementById('siteWrap');
const zoomToggle = document.getElementById('zoomToggle');

// Panel position mapping - 9 panels in complete 3x3 grid
const panelMap = {
  'home': { x: 0, y: 0 },
  'work': { x: 0, y: 1 },
  'skills': { x: -1, y: 1 },
  'projects': { x: 1, y: 1 },
  'about': { x: -1, y: 0 },
  'education': { x: 1, y: 0 },
  'research': { x: -1, y: -1 },
  'testimonials': { x: 0, y: -1 },
  'contact': { x: 1, y: -1 },
};

// Reverse mapping from coordinates to panel name
const coordToPanel = {};
Object.entries(panelMap).forEach(([name, { x, y }]) => {
  coordToPanel[`${x},${y}`] = name;
});

/* =================================================================
   POSITION & TRANSFORM FUNCTIONS
   ================================================================= */

function updatePosition() {
  const translateX = pos_x * -100;
  const translateY = pos_y * -100;
  siteWrap.style.transform = `translate(${translateX}vw, ${translateY}vh)`;
  updateURL();
}

function moveToPanel(x, y) {
  pos_x = x;
  pos_y = y;
  updatePosition();
}

function moveUp() {
  if (!isZoomMode) moveToPanel(pos_x, pos_y - 1);
}

function moveDown() {
  if (!isZoomMode) moveToPanel(pos_x, pos_y + 1);
}

function moveLeft() {
  if (!isZoomMode) moveToPanel(pos_x - 1, pos_y);
}

function moveRight() {
  if (!isZoomMode) moveToPanel(pos_x + 1, pos_y);
}

/* =================================================================
   ZOOM FUNCTIONALITY
   ================================================================= */

function toggleZoom() {
  isZoomMode = !isZoomMode;
  
  if (isZoomMode) {
    zoomOut();
  } else {
    zoomIn();
  }
}

function zoomOut() {
  siteWrap.classList.add('zoom-mode');
  zoomToggle.textContent = '×';
  zoomToggle.style.zIndex = '1001';
}

function zoomIn() {
  siteWrap.classList.remove('zoom-mode');
  zoomToggle.textContent = '🔍';
  zoomToggle.style.zIndex = '1000';
}

function handlePanelNavClick(panelName) {
  const pos = panelMap[panelName];
  if (pos) {
    moveToPanel(pos.x, pos.y);
    if (isZoomMode) {
      zoomIn();
      isZoomMode = false;
    }
  }
}

/* =================================================================
   URL & HISTORY MANAGEMENT
   ================================================================= */

function updateURL() {
  const panelName = coordToPanel[`${pos_x},${pos_y}`];
  if (panelName) {
    window.location.hash = panelName;
  }
}

function handleURLChange() {
  const hash = window.location.hash.slice(1).toLowerCase();
  if (hash && panelMap[hash]) {
    const pos = panelMap[hash];
    pos_x = pos.x;
    pos_y = pos.y;
    updatePosition();
  }
}

/* =================================================================
   EVENT LISTENERS
   ================================================================= */

// Zoom button
zoomToggle.addEventListener('click', toggleZoom);

// Click on panels when zoomed out to navigate
document.querySelectorAll('.panel').forEach(panel => {
  panel.addEventListener('click', (e) => {
    // Don't navigate if clicking on zoom button, link, or button
    if (e.target === zoomToggle || e.target.closest('#zoomToggle')) return;
    if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
    
    // Only navigate if in zoom mode
    if (isZoomMode) {
      const xPos = parseInt(panel.getAttribute('data-x-pos'));
      const yPos = parseInt(panel.getAttribute('data-y-pos'));
      moveToPanel(xPos, yPos);
      zoomIn();
      isZoomMode = false;
    }
  });
});

// Panel navigation labels
document.querySelectorAll('.panel-nav').forEach(label => {
  label.addEventListener('click', (e) => {
    e.stopPropagation();
    const text = e.target.textContent.trim().toLowerCase();
    
    // Find panel name by matching text
    for (const [panelName, _] of Object.entries(panelMap)) {
      if (panelName.toLowerCase().includes(text) || text.includes(panelName.toLowerCase())) {
        handlePanelNavClick(panelName);
        return;
      }
    }
    
    // Alternative matching for multi-word panels
    const textMap = {
      'skills': 'skills',
      'about': 'about',
      'projects': 'projects',
      'work': 'work',
      'education': 'education',
      'testimonials': 'testimonials',
      'contact': 'contact',
      'research': 'research',
      'home': 'home'
    };
    
    Object.entries(textMap).forEach(([key, panelName]) => {
      if (text.includes(key)) {
        handlePanelNavClick(panelName);
      }
    });
  });
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (isZoomMode) return;
  
  switch(e.key) {
    case 'ArrowUp':
      moveUp();
      e.preventDefault();
      break;
    case 'ArrowDown':
      moveDown();
      e.preventDefault();
      break;
    case 'ArrowLeft':
      moveLeft();
      e.preventDefault();
      break;
    case 'ArrowRight':
      moveRight();
      e.preventDefault();
      break;
  }
});

// Handle URL changes (browser back/forward)
window.addEventListener('hashchange', handleURLChange);

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  handleURLChange();
});

/* =================================================================
   EVENT LISTENERS
   ================================================================= */

// Zoom toggle button
zoomToggle.addEventListener('click', toggleZoom);

// Navigation button listeners
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const panelName = btn.getAttribute('data-next');
    if (panelName && panelMap[panelName]) {
      const pos = panelMap[panelName];
      moveToPanel(pos.x, pos.y);
    }
  });
});

// Zoom label click handlers
document.querySelectorAll('.zoom-label').forEach(label => {
  label.addEventListener('click', (e) => {
    e.stopPropagation();
    const panelName = label.getAttribute('data-panel');
    handlePanelClick(panelName);
  });
});

// Scroll wheel zoom toggle
let scrollTimeout;
let lastScrollTime = 0;

document.addEventListener('wheel', (e) => {
  const now = Date.now();
  
  // Ignore if scrolling too frequently (prevent accidental zoom)
  if (now - lastScrollTime < 300) return;
  lastScrollTime = now;

  // Check if it's a scroll or zoom gesture (Ctrl + wheel or trackpad zoom)
  if (e.ctrlKey || (Math.abs(e.deltaY) > 100)) {
    e.preventDefault();
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      // Only toggle if not already transitioning
      if (!siteWrap.style.transition || siteWrap.style.transition === 'none') {
        toggleZoom();
      }
    }, 200);
  }
}, { passive: false });

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (isZoomMode) return; // Disable navigation in zoom mode
  
  switch(e.key) {
    case 'ArrowUp':
      e.preventDefault();
      moveUp();
      break;
    case 'ArrowDown':
      e.preventDefault();
      moveDown();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      moveLeft();
      break;
    case 'ArrowRight':
      e.preventDefault();
      moveRight();
      break;
    case 'Escape':
      e.preventDefault();
      zoomIn();
      isZoomMode = false;
      break;
  }
});

// Touch gestures for mobile
let touchStartX = 0;
let touchStartY = 0;
let touchDistance = 0;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  
  if (e.touches.length === 2) {
    touchDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
  }
}, false);

document.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2) {
    const newDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    
    const diff = newDistance - touchDistance;
    if (Math.abs(diff) > 50) {
      e.preventDefault();
      if (!isZoomMode) {
        toggleZoom();
      }
    }
  }
}, { passive: false });

document.addEventListener('touchend', (e) => {
  if (isZoomMode) return;
  
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  
  const minSwipeDistance = 50;
  
  if (Math.abs(deltaX) > minSwipeDistance) {
    if (deltaX > 0) moveLeft();
    else moveRight();
  } else if (Math.abs(deltaY) > minSwipeDistance) {
    if (deltaY > 0) moveUp();
    else moveDown();
  }
}, false);

/* =================================================================
   URL HASH NAVIGATION
   ================================================================= */

function updateURL() {
  const panelName = coordToPanel[`${pos_x},${pos_y}`];
  if (panelName) {
    window.history.replaceState(null, '', `#${panelName}`);
  }
}

function loadFromURL() {
  const hash = window.location.hash.slice(1);
  if (hash && panelMap[hash]) {
    const pos = panelMap[hash];
    pos_x = pos.x;
    pos_y = pos.y;
    updatePosition();
  }
}

window.addEventListener('hashchange', () => {
  if (!isZoomMode) {
    loadFromURL();
  }
});

/* =================================================================
   INITIALIZATION
   ================================================================= */

function init() {
  // Load from URL hash if available
  loadFromURL();
  
  // Set initial URL
  updateURL();
  
  // Prevent default scroll behavior
  document.body.style.overflow = 'hidden';
  
  console.log('Grid Portfolio initialized');
  console.log('Controls:');
  console.log('- Arrow keys: Navigate between panels');
  console.log('- Click navigation buttons: Jump to panel');
  console.log('- 🔍 button or Ctrl+Scroll: Toggle zoom mode');
  console.log('- In zoom mode: Click panel names to navigate');
  console.log('- Touch: Swipe to navigate, pinch to zoom');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
