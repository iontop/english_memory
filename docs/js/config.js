// Frontend API Configuration for GitHub Pages & Render
const API_CONFIG = {
    // Default Render production endpoint URL (Replace with your actual Render service URL)
    PRODUCTION_API_BASE: "https://english-memory-backend.onrender.com/api",
    
    // Get active API base URL based on environment
    getBaseUrl: function() {
        // Check if user specified a custom Render backend URL in localStorage
        const customUrl = localStorage.getItem("CUSTOM_API_BASE_URL");
        if (customUrl) return customUrl.endsWith('/api') ? customUrl : `${customUrl.replace(/\/$/, '')}/api`;

        const host = window.location.hostname;
        if (host === "localhost" || host === "127.0.0.1" || host.startsWith("192.168.")) {
            // Local Flask backend environment
            return `${window.location.origin}/api`;
        }
        // GitHub Pages (iontop.github.io/english_memory) or external production environment
        return this.PRODUCTION_API_BASE;
    },

    // Utility to easily update backend Render URL from UI or console
    setBackendUrl: function(url) {
        if (url && url.trim()) {
            let cleanUrl = url.trim();
            if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
                cleanUrl = 'https://' + cleanUrl;
            }
            localStorage.setItem("CUSTOM_API_BASE_URL", cleanUrl);
        } else {
            localStorage.removeItem("CUSTOM_API_BASE_URL");
        }
        window.location.reload();
    }
};

const API_BASE_URL = API_CONFIG.getBaseUrl();
