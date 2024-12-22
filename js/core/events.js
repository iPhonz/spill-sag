import { handleSearch } from '../services/search-service.js';
import { debounce } from '../utils/helpers.js';

export function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) {
        throw new Error('Search input element not found');
    }

    const debouncedSearch = debounce(handleSearch, 300);
    searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));

    window.addEventListener('error', handleGlobalError);
}

function handleGlobalError(event) {
    console.error('Global error:', event.error);
    // Implement error handling logic
}