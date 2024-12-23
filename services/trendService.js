// Simulate network delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Sample trend data
const sampleTrends = [
    { title: 'Trend 1', count: '10K' },
    { title: 'Trend 2', count: '5K' }
];

export const trendService = {
    // Get trending topics
    getTrends: async () => {
        await delay(800); // Simulate network delay

        // Simulate occasional errors
        if (Math.random() < 0.1) {
            throw new Error('Failed to fetch trends');
        }

        return sampleTrends;
    }
};