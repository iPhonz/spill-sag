export async function initializeWeather() {
    try {
        const weatherInfo = document.getElementById('weatherInfo');
        if (!weatherInfo) throw new Error('Weather info element not found');

        const weather = await fetchWeatherData();
        updateWeatherDisplay(weather);
    } catch (error) {
        console.error('Weather initialization error:', error);
        document.getElementById('weatherInfo').textContent = '--°F';
    }
}

async function fetchWeatherData() {
    // Replace with actual weather API call
    return { temperature: 72, unit: 'F' };
}

function updateWeatherDisplay(weather) {
    const weatherInfo = document.getElementById('weatherInfo');
    weatherInfo.textContent = `${weather.temperature}°${weather.unit}`;
}