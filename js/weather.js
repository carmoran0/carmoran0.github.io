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
        const snowflakeCount = 25; // Reducido de 50 a 25 para mejor rendimiento
        const fragment = document.createDocumentFragment(); // Optimización DOM
        for (let i = 0; i < snowflakeCount; i++) {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake';
            snowflake.textContent = '❄';
            snowflake.style.cssText = `left:${Math.random()*100}%;animation-duration:${Math.random()*9+4}s;animation-delay:${Math.random()*5}s;font-size:${Math.random()*10+10}px;opacity:${Math.random()*0.6+0.4}`;
            fragment.appendChild(snowflake);
        }
        container.appendChild(fragment); // Una sola operación DOM
    }
    
    function createRain(container) {
        const dropCount = 50; // Reducido de 100 a 50 para mejor rendimiento
        const fragment = document.createDocumentFragment(); // Optimización DOM
        for (let i = 0; i < dropCount; i++) {
            const drop = document.createElement('div');
            drop.className = 'raindrop';
            drop.style.cssText = `left:${Math.random()*100}%;animation-duration:${Math.random()*0.5+0.5}s;animation-delay:${Math.random()*2}s`;
            fragment.appendChild(drop);
        }
        container.appendChild(fragment); // Una sola operación DOM
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
