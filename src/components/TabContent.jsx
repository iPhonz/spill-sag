import React from 'react';
import { useArticles } from '../contexts/ArticleContext';

export const TabContent = () => {
  const { articles, loading } = useArticles();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 w-full bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!articles?.length) {
    return (
      <div className="text-gray-400 text-center py-8">
        No articles available
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