let map; // Declare map variable outside the event listener

document.getElementById('getWeatherBtn').addEventListener('click', function() {
    const city = document.getElementById('cityInput').value.trim();
    const apiKey = '89935844c238de048a31ef0d455713da';
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    // Clear previous results
    document.getElementById('weatherResult').innerHTML = '';

    fetch(apiUrl)
        .then(response => {
            console.log('Response:', response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Data:', data);
            if (data.cod === 200) {
                const weatherDescription = data.weather[0].description;
                const lat = data.coord.lat;
                const lon = data.coord.lon;
                let weatherData = `
                    <h2>${data.name}, ${data.sys.country}</h2>
                    <p><strong>Temperature:</strong> ${data.main.temp}°C</p>
                    <p><strong>Weather:</strong> ${weatherDescription}</p>
                    <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
                    <p><strong>Wind Speed:</strong> ${data.wind.speed} m/s</p>
                `;

                if (data.rain) {
                    const rainVolume = data.rain['1h'] || data.rain['3h'];
                    weatherData += `<p><strong>Rain:</strong> ${rainVolume} mm/h</p>`;
                }

                if (weatherDescription.includes('rain')) {
                    weatherData += `<p><strong>Note:</strong> Don't forget your umbrella! It's raining.</p>`;
                } else if (weatherDescription.includes('clear')) {
                    weatherData += `<p><strong>Note:</strong> It's sunny outside! Enjoy the sunshine.</p>`;
                } else if (weatherDescription.includes('clouds')) {
                    weatherData += `<p><strong>Note:</strong> It's cloudy today. You might need a light jacket.</p>`;
                }

                document.getElementById('weatherResult').innerHTML = weatherData;

                // If the map is already initialized, remove it
                if (map) {
                    map.remove(); // Removes the existing map instance
                }

                // Show the map container
                const mapContainer = document.getElementById('map');
                mapContainer.classList.add('visible');

                // Initialize the map
                map = L.map('map').setView([lat, lon], 10);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);

                // Add wind map layer
                L.tileLayer(`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
                    attribution: '© OpenWeatherMap',
                    opacity: 0.7
                }).addTo(map);

            } else {
                document.getElementById('weatherResult').innerHTML = `<p>Error: ${data.message}</p>`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('weatherResult').innerHTML = `<p>Error fetching weather data: ${error.message}</p>`;
        });
});
