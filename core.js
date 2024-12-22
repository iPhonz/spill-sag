// Previous code remains the same until updateDisplay method

    updateDisplay() {
        const articleGrid = document.getElementById('articleGrid');
        if (!articleGrid) return;

        if (this.state.loading && this.state.articles.length === 0) {
            articleGrid.innerHTML = this.renderLoadingGrid();
            return;
        }

        let articles = [...this.state.articles];

        if (this.state.currentFeed !== 'all') {
            articles = articles.filter(article => article.topic === this.state.currentFeed);
        }

        if (this.state.searchQuery) {
            const query = this.state.searchQuery.toLowerCase();
            articles = articles.filter(article => 
                article.title.toLowerCase().includes(query) ||
                (article.description || '').toLowerCase().includes(query)
            );
        }

        articles.sort((a, b) => new Date(b.date_published) - new Date(a.date_published));

        if (articles.length === 0) {
            articleGrid.innerHTML = '<div class="no-results">No articles found</div>';
            return;
        }

        articleGrid.innerHTML = articles.map(article => `
            <article class="article-card" onclick="window.open('${article.url}', '_blank')">
                ${article.image ? `
                    <img src="${article.image}" 
                         alt="${article.title}" 
                         class="article-image"
                         onerror="this.style.display='none'">
                ` : `
                    <div class="article-image" style="background: var(--bg-darker);"></div>
                `}
                <div class="article-content">
                    <h2 class="article-title">${article.title}</h2>
                    <div class="article-meta">
                        <span>${new Date(article.date_published).toLocaleDateString()}</span>
                        <span class="topic-badge">${article.topic.charAt(0).toUpperCase() + article.topic.slice(1)}</span>
                    </div>
                </div>
            </article>
        `).join('');
    }

    renderLoadingGrid() {
        return `
            <div class="loading-grid">
                ${Array(6).fill().map(() => `
                    <div class="loading-card"></div>
                `).join('')}
            </div>
        `;
    }

    // Previous code remains the same until updateTicker method

    updateTicker(trends) {
        const ticker = document.getElementById('tickerContent');
        if (!ticker || !trends.length) return;

        const content = trends.map(trend => 
            `<span class="ticker-item" onclick="app.searchKeyword('${trend.text}')">` +
            `${trend.text} (${trend.count})` +
            '</span>'
        ).join(' • ');

        // Add extra copies for smoother looping
        ticker.innerHTML = `${content} • ${content} • ${content}`;
        
        // Reset animation
        requestAnimationFrame(() => {
            ticker.style.animation = 'none';
            ticker.offsetHeight;
            ticker.style.animation = 'ticker 45s linear infinite';
        });
    }

    // Rest of the code remains the same