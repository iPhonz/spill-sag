import { initWeather } from './weather.js';
import { initTrending } from './trending.js';
import { initSearch } from './search.js';

// Initialize all modules when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initWeather();
    initTrending();
    initSearch();
});