import { useState, useEffect } from 'react';
import { fetchArticles } from '../api/articles';

export const useArticles = (activeTab) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchArticles(activeTab);
        
        if (isMounted) {
          setArticles(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    loadArticles();

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  return { articles, loading, error };
};