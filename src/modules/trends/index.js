import { TrendEngine } from './TrendEngine';
import { TrendDisplay } from './TrendDisplay';

class TrendManager {
  constructor(options = {}) {
    this.engine = new TrendEngine();
    this.displays = new Map();
    this.options = {
      tickerContainer: document.getElementById('trendingTicker'),
      sidebarContainer: document.getElementById('trendingSidebar'),
      onTrendSelect: () => {},
      ...options
    };

    this.initialize();
  }

  initialize() {
    if (this.options.tickerContainer) {
      this.displays.set('ticker', new TrendDisplay(this.options.tickerContainer, {
        onTrendClick: this.handleTrendSelect.bind(this)
      }));
    }

    if (this.options.sidebarContainer) {
      this.displays.set('sidebar', new TrendDisplay(this.options.sidebarContainer, {
        onTrendClick: this.handleTrendSelect.bind(this)
      }));
    }
  }

  update(articles) {
    const trends = this.engine.analyze(articles);
    this.displays.forEach(display => display.update(trends));
    return trends;
  }

  handleTrendSelect(trend) {
    this.displays.forEach(display => display.highlightTrend(trend.id));
    this.options.onTrendSelect(trend);
  }
}

export default TrendManager;