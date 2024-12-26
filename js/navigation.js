import { CATEGORY_MAPPING } from './constants.js';
import { fetchFeeds } from './feeds.js';

export function initNavigation() {
    const nav = document.querySelector('.nav-menu');
    if (!nav) return;

    nav.addEventListener('click', async (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const categoryName = e.target.textContent.trim();
            const categoryKey = CATEGORY_MAPPING[categoryName];

            document.querySelectorAll('.nav-menu a').forEach(a => 
                a.classList.toggle('active', a === e.target)
            );

            try {
                await loadCategoryContent(categoryKey);
            } catch (error) {
                console.error('Error loading category:', error);
                document.getElementById('article-grid').innerHTML = 
                    '<div class="error">Error loading articles</div>';
            }
        }
    });

    // Load default category
    loadCategoryContent('all-news');
}

async function loadCategoryContent(category) {
    const grid = document.getElementById('article-grid');
    if (!grid) return;

    grid.innerHTML = '<div class="loading">Loading articles...</div>';

    try {
        const articles = await fetchFeeds(category);
        grid.innerHTML = articles.map(article => `
            <article class="article-card">
                ${article.image ? `
                    <div class="article-image-container">
                        <img src="${article.image}" class="article-image" alt="">
                    </div>` : ''}
                <div class="article-content">
                    <h3><a href="${article.link}" target="_blank">${article.title}</a></h3>
                    <p>${article.description || ''}</p>
                    <div class="article-meta">
                        <span class="category-tag">${article.category || ''}</span>
                        <time>${article.date.toLocaleDateString()}</time>
                    </div>
                </div>
            </article>
        `).join('');
    } catch (error) {
        grid.innerHTML = '<div class="error">Failed to load articles</div>';
        throw error;
    }
}