// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const themeIcon = themeToggle.querySelector('i');
const themeTooltip = themeToggle.querySelector('.tooltip');

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    themeTooltip.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
}

// View Toggle
const viewToggle = document.getElementById('viewToggle');
const viewIcon = viewToggle.querySelector('i');
let isMobileView = false;

viewToggle.addEventListener('click', () => {
    isMobileView = !isMobileView;
    viewIcon.className = isMobileView ? 'fas fa-mobile-alt' : 'fas fa-desktop';
    document.body.classList.toggle('mobile-view', isMobileView);
});

// Tool Cards Hover Effect
const toolCards = document.querySelectorAll('.tool-card');

toolCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('ServiceWorker registration successful:', registration.scope);
            })
            .catch((error) => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// Handle Tool Card Clicks
toolCards.forEach(card => {
    card.addEventListener('click', () => {
        const tool = card.getAttribute('data-tool');
        if (tool === 'case') {
            window.location.href = 'tools/case-converter/case-converter.html';
        } else {
            // We'll implement the navigation to other tool pages later
            console.log(`Navigating to ${tool} tool page`);
        }
    });
});

// Offline Mode Toggle
const offlineToggle = document.getElementById('offlineToggle');
const offlineIcon = offlineToggle.querySelector('i');
const offlineTooltip = offlineToggle.querySelector('.tooltip');
let isOffline = false;

// Check initial online status
updateOnlineStatus();

// Listen for online/offline events
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

offlineToggle.addEventListener('click', () => {
    isOffline = !isOffline;
    updateOfflineUI();
});

function updateOnlineStatus() {
    if (navigator.onLine) {
        offlineToggle.classList.remove('offline');
        offlineIcon.className = 'fas fa-wifi';
        offlineTooltip.textContent = 'Online Mode';
        isOffline = false;
    } else {
        offlineToggle.classList.add('offline');
        offlineIcon.className = 'fas fa-wifi';
        offlineTooltip.textContent = 'Offline Mode';
        isOffline = true;
    }
    // Add rotation animation
    offlineIcon.classList.add('rotating');
    setTimeout(() => offlineIcon.classList.remove('rotating'), 500);
}

function updateOfflineUI() {
    if (isOffline) {
        offlineToggle.classList.add('offline');
        offlineIcon.className = 'fas fa-wifi';
        offlineTooltip.textContent = 'Offline Mode';
    } else {
        offlineToggle.classList.remove('offline');
        offlineIcon.className = 'fas fa-wifi';
        offlineTooltip.textContent = 'Online Mode';
    }
    // Add rotation animation
    offlineIcon.classList.add('rotating');
    setTimeout(() => offlineIcon.classList.remove('rotating'), 500);
}

// Header Scroll Effect
const header = document.querySelector('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add/remove at-top class based on scroll position
    if (currentScroll <= 0) {
        header.classList.add('at-top');
    } else {
        header.classList.remove('at-top');
    }
    
    lastScroll = currentScroll;
});

// Search Functionality
const searchInput = document.getElementById('searchTools');

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    toolCards.forEach(card => {
        const toolName = card.querySelector('h3').textContent.toLowerCase();
        const toolDesc = card.querySelector('p').textContent.toLowerCase();
        
        if (toolName.includes(searchTerm) || toolDesc.includes(searchTerm)) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.5s ease forwards';
        } else {
            card.style.display = 'none';
        }
    });
});

// User Menu Toggle
const userAvatar = document.getElementById('userAvatar');
const userMenu = document.querySelector('.user-menu');

userAvatar.addEventListener('click', () => {
    userMenu.classList.toggle('active');
});

// Close user menu when clicking outside
document.addEventListener('click', (e) => {
    if (!userAvatar.contains(e.target) && !userMenu.contains(e.target)) {
        userMenu.classList.remove('active');
    }
});

// Tools Menu Toggle
const toolsMenuBtn = document.getElementById('toolsMenu');
const toolsMenuContainer = document.querySelector('.tools-menu-container');
const toolsMenu = document.querySelector('.tools-menu');
const menuSearchInput = document.getElementById('menuSearchTools');
const toolsMenuItems = document.querySelectorAll('.tools-menu-item');

toolsMenuBtn.addEventListener('click', () => {
    toolsMenuContainer.classList.toggle('active');
    toolsMenu.classList.toggle('active');
});

// Close tools menu when clicking outside
document.addEventListener('click', (e) => {
    if (!toolsMenuBtn.contains(e.target) && !toolsMenu.contains(e.target)) {
        toolsMenuContainer.classList.remove('active');
        toolsMenu.classList.remove('active');
    }
});

// Search functionality for tools menu
menuSearchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    toolsMenuItems.forEach(item => {
        const toolName = item.querySelector('span').textContent.toLowerCase();
        const toolIcon = item.querySelector('i').className.toLowerCase();
        
        if (toolName.includes(searchTerm) || toolIcon.includes(searchTerm)) {
            item.style.display = 'flex';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        } else {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-10px)';
            setTimeout(() => {
                item.style.display = 'none';
            }, 300);
        }
    });
}); 