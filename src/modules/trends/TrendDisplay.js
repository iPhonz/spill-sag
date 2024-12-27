class TrendDisplay {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      onTrendClick: () => {},
      onTrendHover: () => {},
      ...options
    };
    this.trends = [];
    this.bindEvents();
  }

  bindEvents() {
    this.container.addEventListener('click', (e) => {
      const trendElement = e.target.closest('[data-trend-id]');
      if (trendElement) {
        const trendId = trendElement.dataset.trendId;
        const trendData = this.getTrendData(trendId);
        if (trendData) {
          this.options.onTrendClick(trendData);
          this.highlightTrend(trendId);
        }
      }
    });

    if (this.options.onTrendHover) {
      this.container.addEventListener('mouseenter', (e) => {
        const trendElement = e.target.closest('[data-trend-id]');
        if (trendElement) {
          const trendId = trendElement.dataset.trendId;
          const trendData = this.getTrendData(trendId);
          if (trendData) {
            this.options.onTrendHover(trendData);
          }
        }
      }, true);
    }
  }

  update(trends) {
    this.trends = trends;
    this.render();
  }

  render() {
    if (this.container.id === 'trendingTicker') {
      this.renderTicker();
    } else if (this.container.id === 'trendingSidebar') {
      this.renderSidebar();
    }
  }

  renderTicker() {
    this.container.innerHTML = this.trends.map(trend => `
      <div class="trend-item" data-trend-id="${trend.id}">
        <span class="trend-name">${trend.name}</span>
        <span class="trend-count">(${trend.mentions.length})</span>
        <span class="trend-topic">${trend.topics[0]}</span>
      </div>
    `).join('');

    // Clone for continuous scroll
    const clone = this.container.innerHTML;
    this.container.innerHTML += clone;
    this.initializeScroll();
  }

  renderSidebar() {
    this.container.innerHTML = this.trends.map(trend => `
      <div class="trending-topic" data-trend-id="${trend.id}">
        <div class="topic-name">${trend.name}</div>
        <div class="topic-meta">
          <span>${trend.displayText}</span>
          <span class="topic-category">${trend.topics[0]}</span>
        </div>
      </div>
    `).join('');
  }

  initializeScroll() {
    const totalWidth = this.container.scrollWidth / 2;
    const duration = totalWidth / 50; // 50px per second
    this.container.style.animation = `ticker ${duration}s linear infinite`;
  }

  highlightTrend(trendId) {
    const items = this.container.querySelectorAll('[data-trend-id]');
    items.forEach(item => {
      item.classList.toggle('active', item.dataset.trendId === trendId);
    });
  }

  getTrendData(trendId) {
    return this.trends.find(trend => trend.id === trendId);
  }
}