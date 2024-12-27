class SpillApp {
  constructor() {
    this.articles = [];
    this.filteredArticles = [];
    this.searchQuery = '';
  }

  async init() {
    await this.loadArticles();
    this.setupEventListeners();
    this.updateDisplay();
  }

  async loadArticles() {
    // Article loading logic...
  }

  updateDisplay() {
    const container = document.getElementById('articleGrid');
    if (!container) return;

    const articles = this.filteredArticles.length > 0 ? 
      this.filteredArticles : this.articles;

    container.innerHTML = articles
      .map(article => this.renderArticle(article))
      .join('');

    updateTrends(this.articles);
  }

  filterArticles(articles) {
    this.filteredArticles = articles;
    this.updateDisplay();
  }

  clearFilter() {
    this.filteredArticles = [];
    this.updateDisplay();
  }

  setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.clearFilter();
      });
    }
  }

  renderArticle(article) {
    // Article rendering logic...
  }
}

window.app = new SpillApp();
document.addEventListener('DOMContentLoaded', () => window.app.init());