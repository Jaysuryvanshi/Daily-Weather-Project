// Wait until DOM fully loads
document.addEventListener("DOMContentLoaded", () => {

    // API key
    const API_KEY = "d07e0cdcbf6e0d6f75ad221d97504e27";

    // Elements
    const searchBtn = document.getElementById("searchBtn");
    const locationBtn = document.getElementById("locationBtn");
    const cityinput = document.getElementById("city");
    const dropdown = document.getElementById("recentCities");

    // temperature mode
    let isCelsius = true;

    // ================= SEARCH =================
    searchBtn.addEventListener("click", () => {

        const city = cityinput.value.trim();

        if (!city) {
            showError("Please enter city name ❌");
            return;
        }

        saveCity(city);
        getWeather(city);
    });

    // ================= LOCATION =================
    locationBtn.addEventListener("click", () => {

        navigator.geolocation.getCurrentPosition(pos => {

            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;

            getWeatherByCoords(lat, lon);

        }, () => {
            showError("Location access denied ❌");
        });
    });

    // ================= WEATHER API =================
    async function getWeather(city) {

        showLoading();

        try {
            const res = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?q=${city},IN&units=metric&appid=${API_KEY}`
            );

            const data = await res.json();

            if (data.cod !== "200") {
                showError("City not found ❌");
                return;
            }

            displayWeather(data);

        } catch (err) {
            showError("Something went wrong ⚠️");
        }
    }

    // ================= LOCATION WEATHER =================
    async function getWeatherByCoords(lat, lon) {

        showLoading();

        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );

        const data = await res.json();

        displayWeather(data);
    }

    // ================= DISPLAY WEATHER =================
    function displayWeather(data) {

        const current = data.list[0];
        const cityName = data.city.name;

        const icon = current.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${icon}@4x.png`;

        const temp = current.main.temp;

  const displayTemp = isCelsius 
    ? temp.toFixed(1) + " °C" 
    : (temp * 9/5 + 32).toFixed(1) + " °F";

        const firstLetter = cityName.charAt(0);
        const rest = cityName.slice(1);

        document.getElementById("currentWeather").innerHTML = `
            <h3 class="h">
                <span class="first-letter">${firstLetter}</span>${rest}
            </h3>

            <img class="big-icon" src="${iconUrl}">

            <p class="s">🌡️ Temp: ${displayTemp}</p>
            <p class="ss">💨 Wind: ${current.wind.speed}</p>
            <p class="sss">💧 Humidity: ${current.main.humidity}</p>

            <button id="toggleTemp">°C/°F</button>
            <p id="alertBox"></p>
        `;

        // toggle temperature
        document.getElementById("toggleTemp").addEventListener("click", () => {
            isCelsius = !isCelsius;
            displayWeather(data);
        });

        // alert
        if (temp > 40) {
            document.getElementById("alertBox").innerHTML =
            "🔥 Extreme Heat Alert!";
        }

        // // background change
        // if (temp > 32) {
        //     document.body.style.backgroundImage = "url('s1.png')";
        //     document.body.style.backgroundSize = "cover";
        // }

        // if (temp < 25) {
        //     document.body.style.backgroundImage = "url('r1.png')";
        //     document.body.style.backgroundSize = "cover";
        // }

        // forecast
        const forecastDiv = document.getElementById("forecast");
        forecastDiv.innerHTML = "";

        for (let i = 0; i < data.list.length; i += 8) {

            if (i >= 40) break;

            const item = data.list[i];

            const date = new Date(item.dt_txt);
            const formattedDate = date.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short"
            });

            const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;

            forecastDiv.innerHTML += `
                <div>
                    <p>${formattedDate}</p>
                    <img src="${iconUrl}">
                    <p>🌡️ ${item.main.temp}°C</p>
                    <p>💨 ${item.wind.speed}</p>
                    <p>💧 ${item.main.humidity}%</p>
                </div>
            `;
        }
    }

    // ================= STORAGE =================
    function saveCity(city) {

        let cities = JSON.parse(localStorage.getItem("cities")) || [];

        if (!cities.includes(city)) {
            cities.push(city);
            localStorage.setItem("cities", JSON.stringify(cities));
        }

        loadCities();
    }

    function loadCities() {

        let cities = JSON.parse(localStorage.getItem("cities")) || [];

        dropdown.innerHTML = `<option value="">Recent Cities</option>`;

        cities.forEach(city => {
            dropdown.innerHTML += `<option value="${city}">${city}</option>`;
        });
    }

    dropdown.addEventListener("change", () => {
        getWeather(dropdown.value);
    });

    loadCities();

    // ================= HELPERS =================
    function showError(msg) {
        document.getElementById("currentWeather").innerHTML =
        `<p style="color:red">${msg}</p>`;
    }

    function showLoading() {
        document.getElementById("currentWeather").innerHTML =
        `<p>Loading...</p>`;
    }

});