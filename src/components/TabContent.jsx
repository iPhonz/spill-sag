import React, { useEffect } from 'react';

export const TabContent = ({ activeTab, articles }) => {
  useEffect(() => {
    // Force initial content load for "All News" tab
    if (activeTab === 'All News' && articles.length > 0) {
      displayArticles(articles);
    }
  }, [activeTab, articles]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
};