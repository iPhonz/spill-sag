export function initWeather() {
    // In a real app, this would fetch from a weather API
    const weatherElement = document.getElementById('weather');
    if (weatherElement) {
        updateWeather();
        // Update weather every 30 minutes
        setInterval(updateWeather, 30 * 60 * 1000);
    }
}

async function updateWeather() {
    try {
        // Simulated weather data - replace with actual API call
        const temperature = 72;
        document.getElementById('weather').textContent = `${temperature}°F`;
    } catch (error) {
        console.error('Error updating weather:', error);
    }
}