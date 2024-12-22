import { initializeWeather } from '../services/weather-service.js';
import { initializeArticles } from '../services/articles-service.js';
import { initializeTrends } from '../services/trends-service.js';

export async function initializeApp() {
    try {
        await Promise.all([
            initializeWeather(),
            initializeArticles(),
            initializeTrends()
        ]);
    } catch (error) {
        console.error('Initialization error:', error);
        throw new Error('Failed to initialize one or more services');
    }
}