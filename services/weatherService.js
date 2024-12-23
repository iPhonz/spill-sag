export const weatherService = {
    // Get weather data
    getWeather: async () => {
        try {
            // Simulated API call
            return Promise.resolve({
                temperature: 72,
                unit: 'F'
            });
        } catch (error) {
            console.error('Error fetching weather:', error);
            return { temperature: '--', unit: 'F' };
        }
    }
};