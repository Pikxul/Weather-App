let map;
const apiKey = '89935844c238de048a31ef0d455713da';

document.getElementById('getWeatherBtn').addEventListener('click', function() {
    const city = document.getElementById('cityInput').value.trim();
    if (city) {
        // Update the URL with the city query parameter
        window.history.replaceState(null, '', `?city=${encodeURIComponent(city)}`);
        getWeatherByCity(city);
    }
});

function getWeatherByCity(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    fetchWeather(apiUrl);
}

// On page load, use the URL parameters to fetch weather data
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const city = urlParams.get('city');
    const lat = urlParams.get('lat');
    const lon = urlParams.get('lon');

    if (city) {
        getWeatherByCity(city);
    } else if (lat && lon) {
        getWeatherByLocation(lat, lon);
    }
});

function getWeatherByLocation(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    fetchWeather(apiUrl);
}

function fetchWeather(apiUrl) {
    document.getElementById('weatherResult').innerHTML = '';
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.cod === 200) {
                const weatherDescription = data.weather[0].description.toLowerCase();
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

                // Add weather-specific notes and background animations
                if (weatherDescription.includes('rain')) {
                    weatherData += `<p><strong>Note:</strong> Don't forget your umbrella! It's raining.</p>`;
                    document.body.className = 'rainy';
                } else if (weatherDescription.includes('clear')) {
                    weatherData += `<p><strong>Note:</strong> It's sunny outside! Enjoy the sunshine.</p>`;
                    document.body.className = 'sunny';
                } else if (weatherDescription.includes('clouds')) {
                    weatherData += `<p><strong>Note:</strong> It's cloudy today. You might need a light jacket.</p>`;
                    document.body.className = 'cloudy';
                } else {
                    document.body.className = '';
                }

                document.getElementById('weatherResult').innerHTML = weatherData;

                // If the map is already initialized, remove it
                if (map) {
                    map.remove();
                }

                // Show the map container and initialize the map
                const mapContainer = document.getElementById('map');
                mapContainer.classList.add('visible');
                map = L.map('map').setView([lat, lon], 10);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    //attribution: '© OpenStreetMap contributors'
                }).addTo(map);

                L.tileLayer(`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
                    attribution: 'OpenWeatherMap',
                    opacity: 0.7
                }).addTo(map);

            } else {
                document.getElementById('weatherResult').innerHTML = `<p>Error: ${data.message}</p>`;
                document.body.className = '';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('weatherResult').innerHTML = `<p>Error fetching weather data: ${error.message}</p>`;
            document.body.className = '';
        });
}
