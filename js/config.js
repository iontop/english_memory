// Frontend API Configuration for GitHub Pages & Render
const API_CONFIG = {
    // Default Render production endpoint URL
    PRODUCTION_API_BASE: "https://english-memory-backend.onrender.com/api",
    
    // Normalize any URL input to ensure clean /api suffix
    normalizeUrl: function(url) {
        if (!url) return "";
        let clean = url.trim();
        if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
            clean = 'https://' + clean;
        }
        // Remove trailing slashes and trailing /api if present, then append clean /api
        clean = clean.replace(/\/+$/, '');
        if (clean.endsWith('/api')) {
            clean = clean.substring(0, clean.length - 4);
        }
        return `${clean}/api`;
    },

    // Get active API base URL based on environment
    getBaseUrl: function() {
        const customUrl = localStorage.getItem("CUSTOM_API_BASE_URL");
        if (customUrl) return this.normalizeUrl(customUrl);

        const host = window.location.hostname;
        if (host === "localhost" || host === "127.0.0.1" || host.startsWith("192.168.")) {
            // Local Flask backend environment
            return `${window.location.origin}/api`;
        }
        // GitHub Pages or external production environment
        return this.PRODUCTION_API_BASE;
    },

    // Utility to easily update backend Render URL from UI or console
    setBackendUrl: function(url) {
        if (url && url.trim()) {
            const normalized = this.normalizeUrl(url);
            localStorage.setItem("CUSTOM_API_BASE_URL", normalized);
        } else {
            localStorage.removeItem("CUSTOM_API_BASE_URL");
        }
        window.location.reload();
    }
};

const API_BASE_URL = API_CONFIG.getBaseUrl();
