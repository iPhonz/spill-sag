import React, { createContext, useContext, useEffect, useState } from 'react';

const ArticleContext = createContext();

export const ArticleProvider = ({ children }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All News');

  useEffect(() => {
    fetchInitialArticles();
  }, []);

  const fetchInitialArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/articles?category=All%20News');
      if (!response.ok) throw new Error('Failed to fetch articles');
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error('Error fetching initial articles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ArticleContext.Provider value={{ articles, loading, activeTab, setActiveTab, setArticles }}>
      {children}
    </ArticleContext.Provider>
  );
};

export const useArticles = () => useContext(ArticleContext);