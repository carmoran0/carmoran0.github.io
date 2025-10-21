// Weather overlay system
(function() {
    const WEATHER_TYPES = ['snow', 'rain', 'thunder'];
    const WEATHER_CHANCE = 0.9; // 90% chance to show weather
    
    function initWeather() {
        // Random chance for weather
        if (Math.random() > WEATHER_CHANCE) return;
        
        // Random weather type
        const weatherType = WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];
        
        // Create overlay container
        const overlay = document.createElement('div');
        overlay.id = 'weather-overlay';
        overlay.className = `weather-overlay ${weatherType}`;
        overlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(overlay);
        
        if (weatherType === 'snow') {
            createSnow(overlay);
        } else if (weatherType === 'rain') {
            createRain(overlay);
        } else if (weatherType === 'thunder') {
            createThunder(overlay);
        }
    }
    
    function createSnow(container) {
        const snowflakeCount = 50;
        for (let i = 0; i < snowflakeCount; i++) {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake';
            snowflake.textContent = '❄';
            snowflake.style.left = Math.random() * 100 + '%';
            snowflake.style.animationDuration = (Math.random() * 9 + 4) + 's';
            snowflake.style.animationDelay = Math.random() * 5 + 's';
            snowflake.style.fontSize = (Math.random() * 10 + 10) + 'px';
            snowflake.style.opacity = Math.random() * 0.6 + 0.4;
            container.appendChild(snowflake);
        }
    }
    
    function createRain(container) {
        const dropCount = 100;
        for (let i = 0; i < dropCount; i++) {
            const drop = document.createElement('div');
            drop.className = 'raindrop';
            drop.style.left = Math.random() * 100 + '%';
            drop.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
            drop.style.animationDelay = Math.random() * 2 + 's';
            container.appendChild(drop);
        }
    }
    
    function createThunder(container) {
        // Thunder combines rain with lightning flashes
        createRain(container);
        
        // Add lightning flashes
        function flash() {
            container.classList.add('lightning');
            setTimeout(() => {
                container.classList.remove('lightning');
            }, 100);
            
            // Random next flash between 2-8 seconds
            setTimeout(flash, Math.random() * 6000 + 2000);
        }
        
        // Start flashing after initial delay
        setTimeout(flash, Math.random() * 3000 + 1000);
    }
    
    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWeather);
    } else {
        initWeather();
    }
})();
