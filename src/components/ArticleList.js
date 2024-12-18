import React, { useState, useEffect } from 'react';

const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch articles immediately when component mounts
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch('/api/articles');
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      const data = await response.json();
      setArticles(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading articles: {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      {loading ? (
        <div className="p-4 text-gray-500">Loading articles...</div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <article 
              key={article.id} 
              className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <h2 className="text-xl font-semibold text-white mb-2">
                {article.title}
              </h2>
              <div className="flex space-x-2">
                {article.categories?.map((category) => (
                  <span 
                    key={category}
                    className="px-2 py-1 bg-blue-600 text-sm rounded text-white"
                  >
                    {category}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-gray-300">
                {article.excerpt}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticleList;