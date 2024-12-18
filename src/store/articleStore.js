import create from 'zustand';

export const useArticleStore = create((set) => ({
  articles: [],
  loading: false,
  error: null,
  
  fetchArticles: async (category = 'all') => {
    try {
      set({ loading: true, error: null });
      
      // Replace with your actual API endpoint
      const response = await fetch(`/api/articles${category !== 'all' ? `?category=${category}` : ''}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      
      const data = await response.json();
      set({ articles: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  
  setCategory: (category) => {
    set((state) => {
      state.fetchArticles(category);
    });
  },
}));