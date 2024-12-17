import React, { useEffect, useState } from 'react';
import { useArticles } from '../hooks/useArticles';

export const TabContent = ({ activeTab }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { articles, loading, error } = useArticles(activeTab);
  
  useEffect(() => {
    // Force initialization on component mount
    if (!isInitialized && activeTab === 'All News') {
      setIsInitialized(true);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-pulse text-gray-400">Loading articles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error loading articles. Please try again.
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="text-gray-400 p-4">
        No articles available for this category.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
};