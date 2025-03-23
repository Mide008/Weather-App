const searchInput = document.getElementById("search-city");
const button = document.getElementById("button");
const cityElement = document.getElementById("city");
const currentTimeElement = document.getElementById("current-time");
const temperatureElement = document.getElementById("temperature");
const weatherIcon = document.getElementById("weather-icon");
const weatherDescription = document.getElementById("weather-description");
const humidityElement = document.getElementById("humidity");
const windElement = document.getElementById("wind");
const precipitationElement = document.getElementById("precipitation");
const weatherDetailsReport = document.querySelector(".weather-details-report");
const fullPage = document.querySelector(".full-page");

// API key
const API_KEY = "5e3813c7c992aff53a961601cca5aeb4";


// Create error notification element
const errorNotification = document.createElement("div");
errorNotification.className = "error-notification";
document.querySelector(".full-page").appendChild(errorNotification);

// Function to show error message
function showError(message) {
    errorNotification.textContent = message;
    errorNotification.classList.add("show");
    
    setTimeout(() => {
        errorNotification.classList.remove("show");
    }, 3000);
}

// Function to format time
function formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'P.M' : 'A.M';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    
    return `${hours}:${formattedMinutes} ${ampm}`;
}

// Function to update current time
function updateCurrentTime() {
    const now = new Date();
    currentTimeElement.textContent = formatTime(now);
}

// Update time immediately
updateCurrentTime();

// Update time every minute
setInterval(updateCurrentTime, 60000);

// Function to directly set background image with appropriate opacity
function setWeatherBackground(weatherCondition, isNight = false) {
    let backgroundImage;
    
    // Check if it's night time
    if (isNight) {
        backgroundImage = 'url(./images/night.jpg)';
    } else {
        // Set appropriate weather background
        switch (weatherCondition.toLowerCase()) {
            case "clear":
                backgroundImage = 'url(./images/sunny.jpg)';
                break;
            case "clouds":
                backgroundImage = 'url(./images/cloudy.jpg)';
                break;
            case "rain":
            case "drizzle":
                backgroundImage = 'url(./images/rain.jpg)';
                break;
            case "thunderstorm":
                backgroundImage = 'url(./images/thunderstorm.jpg)';
                break;
            case "snow":
                backgroundImage = 'url(./images/snow.jpg)';
                break;
            case "mist":
            case "fog":
            case "haze":
                backgroundImage = 'url(./images/mist.jpg)';
                break;
            default:
                backgroundImage = 'url(./images/background.jpg)';
                break;
        }
    }
    
    // Apply the background with a semi-transparent overlay
    fullPage.style.backgroundImage = `linear-gradient(rgba(3, 20, 38, 0.6), rgba(4, 12, 24, 0.7)), ${backgroundImage}`;
    fullPage.style.backgroundSize = 'cover';
    fullPage.style.backgroundPosition = 'center';
    fullPage.style.backgroundRepeat = 'no-repeat';
}

// Function to check if it's night time at a specific location
function isNightTime(data) {
    const currentTime = Math.floor(Date.now() / 1000); // Current time in Unix timestamp
    return currentTime < data.sys.sunrise || currentTime > data.sys.sunset;
}

// Function to get weather data using XMLHttpRequest
function getWeatherData(city) {
    const button = document.querySelector(".get-weather-button button");
    button.classList.add("loading");
    button.textContent = "Loading...";
    
    const endPoint = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    
    const request = new XMLHttpRequest();
    request.open("GET", endPoint, true);
    request.send();
    
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            button.classList.remove("loading");
            button.textContent = "Get Weather";
            
            if (request.status === 200) {
                const weather = JSON.parse(request.responseText);
                console.log(weather);
                updateWeatherUI(weather);
                
                // Add animation classes
                weatherDetailsReport.style.opacity = "0.8";
                setTimeout(() => {
                    weatherDetailsReport.style.opacity = "1";
                }, 100);
            } else {
                showError("City not found. Please try again.");
                console.error("Error fetching weather data:", request.statusText);
            }
        }
    };
    
    // Handle network errors
    request.onerror = function() {
        button.classList.remove("loading");
        button.textContent = "Get Weather";
        showError("Network error. Please check your connection.");
        console.error("Network error occurred");
    };
}

// Function to update UI with weather data
function updateWeatherUI(data) {
    // Update city name
    cityElement.textContent = data.name;
    
    // Update temperature and add relevant class
    const temp = Math.round(data.main.temp);
    temperatureElement.textContent = temp;
    
    const tempParent = temperatureElement.parentElement;
    tempParent.classList.remove("cold", "warm", "hot");
    
    if (temp < 10) {
        tempParent.classList.add("cold");
    } else if (temp >= 10 && temp < 25) {
        tempParent.classList.add("warm");
    } else {
        tempParent.classList.add("hot");
    }
    
    // Update weather description and icon
    const weatherCondition = data.weather[0].main;
    weatherDescription.textContent = weatherCondition;
    
    // Reset classes
    weatherIcon.className = "";
    weatherIcon.classList.add("fa-solid");
    
    // Set appropriate weather icon
    switch (weatherCondition) {
        case "clear":
            weatherIcon.classList.add("fa-sun");
            break;
        case "clouds":
            weatherIcon.classList.add("fa-cloud");
            break;
        case "rain":
        case "drizzle":
            weatherIcon.classList.add("fa-cloud-rain");
            break;
        case "thunderstorm":
            weatherIcon.classList.add("fa-bolt");
            break;
        case "snow":
            weatherIcon.classList.add("fa-snowflake");
            break;
        case "mist":
        case "fog":
        case "haze":
            weatherIcon.classList.add("fa-smog");
            break;
        default:
            weatherIcon.classList.add("fa-cloud");
    }

    // Check if it's night time and update background accordingly
    const night = isNightTime(data);
    setWeatherBackground(weatherCondition, night);
    updateCardGlow(weatherCondition);
    
    // If it's night and clear, change the icon to moon
    if (night && weatherCondition.toLowerCase() === "clear") {
        weatherIcon.classList.remove("fa-sun");
        weatherIcon.classList.add("fa-moon");
    }
    
    // Update humidity
    humidityElement.textContent = `${data.main.humidity}%`;
    
    // Update wind speed (convert m/s to km/h)
    const windSpeedKmh = Math.round(data.wind.speed * 3.6);
    windElement.textContent = `${windSpeedKmh} km/h`;
    
    // Set precipitation (chance of rain)
    // Since OpenWeatherMap doesn't directly provide precipitation probability in this API endpoint
    // We'll calculate a value based on humidity and clouds
    const precipitation = Math.min(100, Math.round((data.clouds.all + data.main.humidity) / 4));
    precipitationElement.textContent = `${precipitation}%`;

    // Add a subtle transition effect when changing backgrounds
    fullPage.style.transition = "background-image 1.5s ease-in-out";
}

// Function to preload images for smoother transitions
function preloadWeatherImages() {
    const imageUrls = [
        './images/sunny.jpg',
        './images/cloudy.jpg',
        './images/rain.jpg',
        './images/thunderstorm.jpg',
        './images/snow.jpg',
        './images/mist.jpg',
        './images/night.jpg',
        './images/background.jpg'
    ];
    
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Event listener for button click
button.addEventListener("click", function() {
    const city = searchInput.value.trim();
    if (city) {
        getWeatherData(city);
    } else {
        showError("Please enter a city name");
    }
});

// Event listener for Enter key
searchInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        const city = searchInput.value.trim();
        if (city) {
            getWeatherData(city);
        } else {
            showError("Please enter a city name");
        }
    }
});

// Add dynamic glowing effect to the weather card based on current condition
function updateCardGlow(weatherCondition) {
    let glowColor;
    
    switch (weatherCondition.toLowerCase()) {
        case "clear":
            glowColor = "rgba(255, 166, 0, 0.2)"; // Sunny orange glow
            break;
        case "clouds":
            glowColor = "rgba(158, 158, 158, 0.2)"; // Cloud gray glow
            break;
        case "rain":
        case "drizzle":
            glowColor = "rgba(0, 149, 255, 0.2)"; // Rain blue glow
            break;
        case "thunderstorm":
            glowColor = "rgba(111, 0, 255, 0.2)"; // Thunder purple glow
            break;
        case "snow":
            glowColor = "rgba(200, 200, 255, 0.2)"; // Snow light blue glow
            break;
        default:
            glowColor = "rgba(0, 102, 255, 0.15)"; // Default blue glow
    }
    
    weatherDetailsReport.style.boxShadow = `0 8px 32px ${glowColor}, 0 0 16px ${glowColor}`;
}

// Initial load - default city
window.addEventListener("load", function() {
    getWeatherData("Lagos");
});

// Add subtle animation on mouse move
document.querySelector(".full-page").addEventListener("mousemove", function(e) {
    const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
    
    weatherDetailsReport.style.transform = `translate(${moveX}px, ${moveY}px)`;
});

// // Preload images and initialize with default city on load
// window.addEventListener("load", function() {
//     preloadWeatherImages();
//     getWeatherData("Lagos");
// });

// Add dynamic glowing effect to the weather card based on current condition
function updateCardGlow(weatherCondition) {
    let glowColor;
    
    switch (weatherCondition.toLowerCase()) {
        case "clear":
            glowColor = "rgba(255, 166, 0, 0.2)"; // Sunny orange glow
            break;
        case "clouds":
            glowColor = "rgba(158, 158, 158, 0.2)"; // Cloud gray glow
            break;
        case "rain":
        case "drizzle":
            glowColor = "rgba(0, 149, 255, 0.2)"; // Rain blue glow
            break;
        case "thunderstorm":
            glowColor = "rgba(111, 0, 255, 0.2)"; // Thunder purple glow
            break;
        case "snow":
            glowColor = "rgba(200, 200, 255, 0.2)"; // Snow light blue glow
            break;
        default:
            glowColor = "rgba(0, 102, 255, 0.15)"; // Default blue glow
    }
    
    weatherDetailsReport.style.boxShadow = `0 8px 32px ${glowColor}, 0 0 16px ${glowColor}`;
}