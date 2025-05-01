document.addEventListener('DOMContentLoaded', function() {
    // Get all tool cards
    const toolCards = document.querySelectorAll('.tool-card');

    // Add click event listener to each tool card
    toolCards.forEach(card => {
        card.addEventListener('click', function() {
            const toolType = this.getAttribute('data-tool');
            handleToolClick(toolType);
        });
    });

    // Function to handle tool card clicks
    function handleToolClick(toolType) {
        if (toolType === 'converter') {
            window.location.href = 'image_converter.html';
            return;
        }
        
        if (toolType === 'compressor') {
            window.location.href = 'image_compressor.html';
            return;
        }
        
        // For other tools, show the alert
        const toolNames = {
            'resizer': 'Image Resizer',
            'viewer': 'Image Viewer',
            'cropper': 'Image Cropper',
            'rescale': 'Image Rescale',
            'rotate': 'Image Rotator',
            'upscale': 'Image Upscaler'
        };

        alert(`${toolNames[toolType]} tool will be implemented soon!`);
    }

    // Initialize theme from localStorage or default to light
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    // Function to update theme icon
    function updateThemeIcon(theme) {
        const themeIcon = document.querySelector('#themeToggle i');
        const themeTooltip = document.querySelector('#themeToggle .tooltip');
        
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
            themeTooltip.textContent = 'Light Mode';
        } else {
            themeIcon.className = 'fas fa-moon';
            themeTooltip.textContent = 'Dark Mode';
        }
    }

    // Search functionality
    const searchInput = document.getElementById('searchTools');
    const menuSearchInput = document.getElementById('menuSearchTools');
    const menuItems = document.querySelectorAll('.tools-menu-item');

    function handleSearch(searchTerm, items, isMenu = false) {
        searchTerm = searchTerm.toLowerCase();
        
        items.forEach(item => {
            const title = item.querySelector(isMenu ? 'span' : 'h3').textContent.toLowerCase();
            const description = isMenu ? '' : item.querySelector('p').textContent.toLowerCase();
            const isMatch = title.includes(searchTerm) || description.includes(searchTerm);
            
            if (isMenu) {
                if (isMatch) {
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
            } else {
                if (isMatch) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeIn 0.5s ease forwards';
                } else {
                    item.style.display = 'none';
                }
            }
        });
    }

    searchInput.addEventListener('input', (e) => {
        handleSearch(e.target.value, toolCards);
    });

    menuSearchInput.addEventListener('input', (e) => {
        handleSearch(e.target.value, menuItems, true);
    });

    // Tool card click handler
    document.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', () => {
            const tool = card.getAttribute('data-tool');
            if (tool === 'converter') {
                window.location.href = 'image_converter.html';
            }
            // Add other tool handlers here
        });
    });
}); 