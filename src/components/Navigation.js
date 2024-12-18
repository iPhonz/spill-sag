import React from 'react';
import { useArticleStore } from './store/articleStore';

const Navigation = () => {
  const { fetchArticles } = useArticleStore();
  
  const categories = [
    { id: 'all', label: 'All News' },
    { id: 'movies', label: 'Movies & TV' },
    { id: 'music', label: 'Music' },
    { id: 'money', label: 'Money' },
    { id: 'culture', label: 'Pop Culture' },
    { id: 'sports', label: 'Sports' },
    { id: 'tech', label: 'Technology & AI' },
  ];
  
  return (
    <div className="flex space-x-4 overflow-x-auto">
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => fetchArticles(category.id)}
          className="px-4 py-2 text-white hover:bg-blue-600 rounded-lg transition-colors"
        >
          {category.label}
        </button>
      ))}
    </div>
  );
};

export default Navigation;