// Previous RSS feed and trending functionality remains...

function generateArticleId(article) {
    // Create a URL-friendly ID from the article title
    return article.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
}

function updateDisplay() {
    const articlesGrid = document.getElementById('articleGrid');
    let filteredArticles = allArticles;

    if (currentFeed !== 'all') {
        filteredArticles = filteredArticles.filter(article => article.topic === currentFeed);
    }

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredArticles = filteredArticles.filter(article => 
            article.title.toLowerCase().includes(query) ||
            (article.description || '').toLowerCase().includes(query)
        );
    }

    filteredArticles.sort((a, b) => new Date(b.date_published) - new Date(a.date_published));

    articlesGrid.innerHTML = filteredArticles.map(article => {
        const articleId = generateArticleId(article);
        return `
            <article class="article-card" id="${articleId}">
                <div class="article-image-container">
                    ${article.image ? `<img src="${article.image}" alt="${article.title}" class="article-image">` : ''}
                    <button class="share-button" onclick="toggleShareMenu(event, '${articleId}')">📤</button>
                    <div class="share-menu" id="shareMenu-${articleId}">
                        <div class="share-option" onclick="copyArticleLink('${articleId}')">
                            📋 Copy Link
                        </div>
                        <div class="share-option" onclick="shareToTwitter('${articleId}')">
                            🐦 Share on Twitter
                        </div>
                    </div>
                </div>
                <div class="article-content" onclick="window.open('${article.url}', '_blank')">
                    <h2 class="article-title">${article.title}</h2>
                    <div class="article-meta">
                        <span>${new Date(article.date_published).toLocaleDateString()}</span>
                        <span>${article.topic.charAt(0).toUpperCase() + article.topic.slice(1)}</span>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

function toggleShareMenu(event, articleId) {
    event.stopPropagation();
    const shareMenu = document.getElementById(`shareMenu-${articleId}`);
    
    // Close all other share menus first
    document.querySelectorAll('.share-menu').forEach(menu => {
        if (menu.id !== `shareMenu-${articleId}`) {
            menu.classList.remove('active');
        }
    });

    shareMenu.classList.toggle('active');
}

function copyArticleLink(articleId) {
    const article = allArticles.find(a => generateArticleId(a) === articleId);
    const url = new URL(window.location.href);
    url.searchParams.set('article', articleId);
    
    navigator.clipboard.writeText(url.toString()).then(() => {
        const notification = document.getElementById('copyNotification');
        notification.classList.add('active');
        setTimeout(() => notification.classList.remove('active'), 2000);
    });

    // Close share menu
    document.getElementById(`shareMenu-${articleId}`).classList.remove('active');
}

function shareToTwitter(articleId) {
    const article = allArticles.find(a => generateArticleId(a) === articleId);
    const url = new URL(window.location.href);
    url.searchParams.set('article', articleId);
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(url.toString())}`;
    window.open(twitterUrl, '_blank');

    // Close share menu
    document.getElementById(`shareMenu-${articleId}`).classList.remove('active');
}

// Handle deep linking
function handleDeepLink() {
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get('article');
    
    if (articleId) {
        const article = allArticles.find(a => generateArticleId(a) === articleId);
        if (article) {
            // Scroll to article
            setTimeout(() => {
                document.getElementById(articleId)?.scrollIntoView({ behavior: 'smooth' });
            }, 500);
        }
    }
}

// Close share menus when clicking outside
document.addEventListener('click', (event) => {
    if (!event.target.closest('.share-menu') && !event.target.closest('.share-button')) {
        document.querySelectorAll('.share-menu').forEach(menu => {
            menu.classList.remove('active');
        });
    }
});

// Initialize with deep linking support
fetchAllFeeds().then(handleDeepLink);

// Update display when the URL changes
window.addEventListener('popstate', handleDeepLink);
