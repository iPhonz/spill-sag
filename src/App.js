import React, { useEffect } from 'react';
import { useArticleStore } from './store/articleStore';

const App = () => {
  const { fetchArticles, articles, loading, error } = useArticleStore();

  // Fetch articles on initial app load
  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 p-4">
        {/* Navigation items */}
      </nav>
      
      <main className="container mx-auto px-4 py-8">
        {loading && (
          <div className="text-gray-400">Loading articles...</div>
        )}
        
        {error && (
          <div className="text-red-500">Error: {error}</div>
        )}
        
        {!loading && !error && articles.length === 0 && (
          <div className="text-gray-400">No articles found</div>
        )}
        
        {!loading && !error && articles.length > 0 && (
          <div className="grid gap-6">
            {articles.map(article => (
              <article 
                key={article.id}
                className="bg-gray-800 rounded-lg p-6 shadow-lg"
              >
                <h2 className="text-xl font-bold text-white mb-2">
                  {article.title}
                </h2>
                <div className="flex gap-2 mb-4">
                  {article.categories?.map(category => (
                    <span 
                      key={category}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                <p className="text-gray-300">{article.content}</p>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;