const apiKey = '11e5e890f3eb43d2834153732240111';
let currentUnit = 'C';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const currentLocationBtn = document.getElementById('current-location');
const themeToggle = document.querySelector('.theme-toggle');
const errorMessage = document.getElementById('error-message');

// Theme Toggle
function toggleTheme() {
    document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    themeToggle.innerHTML = document.body.dataset.theme === 'dark' ? 
        '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

themeToggle.addEventListener('click', toggleTheme);

// Update DateTime
function updateDateTime() {
    const dateTime = document.getElementById('date-time');
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    dateTime.textContent = now.toLocaleDateString('en-US', options);
}

// Fetch Weather Data
async function fetchWeather(city) {
    try {
        const response = await fetch(
            `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=3&aqi=yes`
        );

        if (!response.ok) throw new Error('City not found');

        const data = await response.json();
        updateWeatherUI(data);
        errorMessage.style.display = 'none';
    } catch (error) {
        errorMessage.textContent = 'City not found. Please try again.';
        errorMessage.style.display = 'block';
    }
}

// Update Weather UI
function updateWeatherUI(data) {
    // Location
    document.getElementById('city').textContent = data.location.name;
    document.getElementById('country').textContent = `${data.location.region}, ${data.location.country}`;

    // Current Weather
    document.getElementById('temp').textContent = Math.round(data.current.temp_c);
    document.getElementById('weather-desc').textContent = data.current.condition.text;
    document.getElementById('weather-icon').src = data.current.condition.icon;
    document.getElementById('feels-like').textContent = `${Math.round(data.current.feelslike_c)}°C`;
    document.getElementById('humidity').textContent = `${data.current.humidity}%`;
    document.getElementById('wind-speed').textContent = `${data.current.wind_kph} km/h`;
    document.getElementById('wind-dir').textContent = data.current.wind_dir;

    // Forecast
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';

    data.forecast.forecastday.forEach(day => {
        const date = new Date(day.date);
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <p>${date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
            <img src="${day.day.condition.icon}" alt="Weather Icon">
            <p>${Math.round(day.day.maxtemp_c)}°C / ${Math.round(day.day.mintemp_c)}°C</p>
            <p>${day.day.condition.text}</p>
        `;
        forecastContainer.appendChild(forecastItem);
    });

    updateDateTime();
}

// Get Current Location
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                fetchWeather(`${latitude},${longitude}`);
            },
            error => {
                errorMessage.textContent = 'Unable to retrieve your location';
                errorMessage.style.display = 'block';
            }
        );
    } else {
        errorMessage.textContent = 'Geolocation is not supported by your browser';
        errorMessage.style.display = 'block';
    }
}

// Event Listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) fetchWeather(city);
    }
});

currentLocationBtn.addEventListener('click', getCurrentLocation);

// Initial Load
window.onload = () => {
    fetchWeather('London');
    setInterval(updateDateTime, 60000); // Update time every minute
};