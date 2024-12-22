// Weather functionality
(function() {
    const weatherElement = document.getElementById('weatherTemp');
    
    // For demo purposes, set a default temperature
    function updateWeather() {
        if (weatherElement) {
            const temp = Math.round(55 + (Math.random() * 10 - 5)); // Random temp around 55°F
            weatherElement.textContent = `${temp}°F`;
        }
    }

    // Update immediately and every 5 minutes
    updateWeather();
    setInterval(updateWeather, 5 * 60 * 1000);
})();