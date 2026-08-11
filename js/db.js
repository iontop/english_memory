// IndexedDB Engine for English Memory (v0.5.0)
const DB_NAME = 'EnglishMemoryDB';
const DB_VERSION = 1;

const IndexedDBEngine = {
    db: null,

    init: function() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                console.warn("IndexedDB not supported, falling back to localStorage.");
                resolve(false);
                return;
            }

            const request = window.indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('word_sets')) {
                    db.createObjectStore('word_sets', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('srs_progress')) {
                    db.createObjectStore('srs_progress', { keyPath: 'word' });
                }
                if (!db.objectStoreNames.contains('achievements')) {
                    db.createObjectStore('achievements', { keyPath: 'id' });
                }
            };

            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve(true);
            };

            request.onerror = (e) => {
                console.error("IndexedDB Open Error:", e);
                resolve(false);
            };
        });
    },

    saveSRSProgress: function(wordText, level, nextReviewTime) {
        if (!this.db) return;
        try {
            const tx = this.db.transaction('srs_progress', 'readwrite');
            const store = tx.objectStore('srs_progress');
            store.put({ word: wordText.toLowerCase(), level, nextReviewTime, updatedAt: Date.now() });
        } catch (e) {}
    },

    getSRSProgress: function(wordText) {
        return new Promise((resolve) => {
            if (!this.db) { resolve(null); return; }
            try {
                const tx = this.db.transaction('srs_progress', 'readonly');
                const store = tx.objectStore('srs_progress');
                const req = store.get(wordText.toLowerCase());
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => resolve(null);
            } catch (e) { resolve(null); }
        });
    }
};

window.IndexedDBEngine = IndexedDBEngine;
