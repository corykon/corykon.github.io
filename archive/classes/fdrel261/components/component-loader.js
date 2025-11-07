// Component loader for Book of Remembrance site
// This script loads all the web components needed for the site

// Function to load a component script
function loadComponent(componentName) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `components/${componentName}.js`;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Load all components when the DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await Promise.all([
            loadComponent('bor-header'),
            loadComponent('bor-footer'),
            loadComponent('bor-navigation')
        ]);
        
        console.log('All components loaded successfully');
    } catch (error) {
        console.error('Error loading components:', error);
    }
});