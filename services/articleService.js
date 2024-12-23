const sampleArticles = [
    { title: 'Sample Article 1', excerpt: 'This is a sample article excerpt...' },
    { title: 'Sample Article 2', excerpt: 'Another sample article excerpt...' }
];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const articleService = {
    getArticles: async () => {
        await delay(800); // Simulate network delay
        return sampleArticles;
    },

    searchArticles: async (searchTerm) => {
        await delay(300); // Shorter delay for search
        return sampleArticles.filter(article =>
            article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
};