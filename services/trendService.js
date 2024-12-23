const sampleTrends = [
    { title: 'Trend 1', count: '10K' },
    { title: 'Trend 2', count: '5K' }
];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const trendService = {
    getTrends: async () => {
        await delay(600); // Simulate network delay
        return sampleTrends;
    }
};