const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const weatherService = {
    getWeather: async () => {
        await delay(400); // Simulate network delay
        return {
            temperature: 72,
            unit: 'F'
        };
    }
};