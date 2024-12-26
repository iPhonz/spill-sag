import { initNavigation } from './navigation.js';
import { initTrending } from './trending.js';
import { initWeather } from './weather.js';
import { initTicker } from './ticker.js';

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initTrending();
    initWeather();
    initTicker();
});