export const fetchArticles = async (category) => {
  try {
    const response = await fetch(`/api/articles?category=${encodeURIComponent(category)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
};