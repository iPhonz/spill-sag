// Sample trend data
const sampleTrends = [
    { title: 'Trend 1', count: '10K' },
    { title: 'Trend 2', count: '5K' }
];

export const trendService = {
    // Get trending topics
    getTrends: async () => {
        try {
            // Simulated API call
            return Promise.resolve(sampleTrends);
        } catch (error) {
            console.error('Error fetching trends:', error);
            return [];
        }
    }
};