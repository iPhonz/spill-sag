// Update local time
function updateTime() {
    const timeElem = document.getElementById('localTime');
    if (!timeElem) return;

    const now = new Date();
    timeElem.textContent = now.toLocaleTimeString('en-US', { 
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

// Update weather
async function updateWeather() {
    const weatherElem = document.getElementById('weatherTemp');
    if (!weatherElem) return;

    try {
        // Get user's location
        const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 5000,
                maximumAge: 300000 // 5 minutes
            });
        });

        // Fetch weather data from Open-Meteo API
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?` +
            `latitude=${pos.coords.latitude}&` +
            `longitude=${pos.coords.longitude}&` +
            `current_weather=true&temperature_unit=fahrenheit`
        );

        if (!response.ok) {
            throw new Error('Weather API error');
        }

        const data = await response.json();
        const temp = Math.round(data.current_weather.temperature);
        weatherElem.textContent = `${temp}°F`;

    } catch (error) {
        console.error('Weather error:', error);
        weatherElem.textContent = '--°F';
    }
}

// Initialize time and weather
document.addEventListener('DOMContentLoaded', () => {
    // Initial updates
    updateTime();
    updateWeather();

    // Set up intervals
    setInterval(updateTime, 60000); // Update time every minute
    setInterval(updateWeather, 900000); // Update weather every 15 minutes
});
