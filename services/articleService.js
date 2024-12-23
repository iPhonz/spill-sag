// Simulate network delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Sample article data
const sampleArticles = [
    { title: 'Sample Article 1', excerpt: 'This is a sample article excerpt...' },
    { title: 'Sample Article 2', excerpt: 'Another sample article excerpt...' }
];

export const articleService = {
    // Get all articles
    getArticles: async () => {
        await delay(1000); // Simulate network delay
        
        // Simulate occasional errors
        if (Math.random() < 0.1) {
            throw new Error('Failed to fetch articles');
        }

        return sampleArticles;
    },

    // Search articles
    searchArticles: async (searchTerm) => {
        await delay(500); // Simulate network delay

        // Simulate occasional errors
        if (Math.random() < 0.1) {
            throw new Error('Search failed');
        }

        return sampleArticles.filter(article =>
            article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
};