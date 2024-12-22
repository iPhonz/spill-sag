import { initializeApp } from './core/initialize.js';
import { setupEventListeners } from './core/events.js';
import { loadInitialContent } from './core/content-loader.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializeApp();
        setupEventListeners();
        await loadInitialContent();
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showErrorMessage('Failed to initialize application. Please try again.');
    }
});

function showErrorMessage(message) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.innerHTML = `
        ${message}
        <button onclick="window.location.reload()" class="retry-button">Retry</button>
    `;
    document.body.appendChild(errorContainer);
}