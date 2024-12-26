import { CATEGORIES } from './config.js';
import { loadContent } from './feed.js';
import { initTicker } from './ticker.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initTicker();
  loadContent('all');
});

function initNavigation() {
  const nav = document.querySelector('.nav-menu');
  if (!nav) return;

  nav.addEventListener('click', async (e) => {
    if (e.target.tagName === 'A') {
      e.preventDefault();
      const categoryName = e.target.textContent.trim();
      const categoryKey = CATEGORIES[categoryName];

      document.querySelectorAll('.nav-menu a').forEach(a => 
        a.classList.toggle('active', a === e.target)
      );

      await loadContent(categoryKey);
    }
  });
}