// Simple weather functionality
function updateWeather() {
    const weatherElement = document.getElementById('weatherTemp');
    if (weatherElement) {
        const temp = Math.round(55 + (Math.random() * 10 - 5));
        weatherElement.textContent = `${temp}°F`;
    }
}

// Update time
function updateTime() {
    const timeElement = document.getElementById('localTime');
    if (timeElement) {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
}

// Initialize
updateWeather();
updateTime();

// Update periodically
setInterval(updateWeather, 5 * 60 * 1000); // Every 5 minutes
setInterval(updateTime, 1000); // Every second