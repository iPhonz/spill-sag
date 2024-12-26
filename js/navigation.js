import { RSS_FEEDS } from './config.js';
import { fetchAndDisplayArticles } from './trending.js';

export function initNavigation() {
    const nav = document.querySelector('.nav-menu');
    if (!nav) return;

    nav.addEventListener('click', async (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const category = e.target.textContent.toLowerCase();
            
            // Update active state
            document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));
            e.target.classList.add('active');

            // Fetch articles for category
            await fetchAndDisplayArticles(category);
        }
    });
}