let articles = [];

export function initializeArticles() {
    return Promise.resolve(); // Add initialization logic if needed
}

export async function fetchArticles() {
    try {
        // Replace with actual API endpoint
        const response = await fetch('/api/articles');
        if (!response.ok) throw new Error('Failed to fetch articles');
        
        articles = await response.json();
        return articles;
    } catch (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
}

export function filterArticles(searchTerm) {
    return articles.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
}