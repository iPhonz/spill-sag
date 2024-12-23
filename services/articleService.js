// Sample article data
const sampleArticles = [
    { title: 'Sample Article 1', excerpt: 'This is a sample article excerpt...' },
    { title: 'Sample Article 2', excerpt: 'Another sample article excerpt...' }
];

export const articleService = {
    // Get all articles
    getArticles: async () => {
        try {
            // Simulated API call
            return Promise.resolve(sampleArticles);
        } catch (error) {
            console.error('Error fetching articles:', error);
            return [];
        }
    },

    // Search articles
    searchArticles: async (searchTerm) => {
        try {
            const articles = await articleService.getArticles();
            return articles.filter(article =>
                article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
            );
        } catch (error) {
            console.error('Error searching articles:', error);
            return [];
        }
    }
};