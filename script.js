const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const searchHistoryList = document.querySelector(".search-history-list");

const API_KEY = "e09412b62d0e86811699a2175d0c724f";





const createWeatherCard = (cityName, weatherItem, index) => {
    if(index === 0) {
       return `<div class="details">

        <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
        <h4>Temperature: ${(weatherItem.main.temp - 237).toFixed(2)}°F</h4>
        <h4>Wind: ${weatherItem.wind.speed}mph</h4>
        <h4>Humidity: ${weatherItem.main.humidity}%</h4>

</div>
<div class="icon">
    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
    <h4>${weatherItem.weather[0].description}</h4>
    </div>`; 
    }else{

    
    return `<li class="card">

        <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
        <h4>Temp: ${(weatherItem.main.temp - 237).toFixed(2)}°F</h4>
        <h4>Wind: ${weatherItem.wind.speed}mph</h4>
        <h4>Humidity: ${weatherItem.main.humidity}%</h4>

    </li>`;
    }
};


const displaySearchHistory = () => {
    const searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];


    searchHistoryList.innerHTML = "";
    searchHistory.forEach((entry) => {
        const listItem = document.createElement("li");
        listItem.textContent = entry;
        searchHistoryList.appendChild(listItem);
    });
};

const addToSearchHistory = (cityName) => {
    const searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

    searchHistory.unshift(cityName);

    const limitedHistory = searchHistory.slice(0, 5);

    localStorage.setItem("searchHistory", JSON.stringify(limitedHistory));

    displaySearchHistory();
};


const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;


    fetch(WEATHER_API_URL)
    .then((res) => res.json())
    .then((data) => {
        const uniqueForecastDays = [];

        const fiveDaysForecast = data.list.filter((forecast) => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });


        cityInput.value = "";

        currentWeatherDiv.innerHTML = "";

        weatherCardsDiv.innerHTML = "";


        fiveDaysForecast.forEach((weatherItem, index) => {
            if (index === 0){

                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));


            }else{

                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));

            }
        });

    })
    .catch(() => {
        alert("An error occurred while loading weather forecast.");
    });

    addToSearchHistory(cityName);
};

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if(!cityName) return;


    const GEOCODING_API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`;


    fetch(GEOCODING_API_URL)
        .then((res) => res.json())
        .then((data) => {
            
            if (data.cod === "404") {
                return alert(`City not found: ${cityName}`);
            }


            const { name, coord } = data;
            getWeatherDetails(name, coord.lat, coord.lon);
        })
        
        .catch(() => {
            alert("An error occurred while fetching the coordinates.");
        });
};

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch (REVERSE_GEOCODING_URL)
            .then((res) => res.json())
            .then((data) => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
            })
            
            .catch(() => {
                alert("An error occurred while fetching the city.");
            });
        },
        error => {
            if(error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location to grant access again");
            }

        }
    );
};

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
document.addEventListener("DOMContentLoaded", displaySearchHistory);

