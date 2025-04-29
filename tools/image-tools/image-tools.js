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
        // For now, just show an alert. This will be replaced with actual tool implementations
        const toolNames = {
            'converter': 'Image Format Converter',
            'compressor': 'Image Compressor',
            'resizer': 'Image Resizer',
            'viewer': 'Image Viewer',
            'cropper': 'Image Cropper',
            'rescale': 'Image Rescale',
            'rotate': 'Image Rotator',
            'upscale': 'Image Upscaler'
        };

        // When tools are implemented, uncomment this code and remove the alert
        // const toolPath = `${toolType}.html`;
        // window.location.href = toolPath;
        
        // For now, just show an alert
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
}); 