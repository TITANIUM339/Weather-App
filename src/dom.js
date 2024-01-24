import { weather } from "./weather.js";
import { format, isTomorrow } from "date-fns";

const displayController = (() => {
    const loadingIcon = document.querySelector(".loading");

    const tiles = document.querySelectorAll(".tile");

    function showLoadingIcon() {
        tiles.forEach((element) => {
            element.classList.remove("tile-show");
        });

        loadingIcon.classList.add("rotate");
    }

    function hideLoadingIcon() {
        tiles.forEach((element) => {
            element.classList.add("tile-show");
        });

        loadingIcon.classList.remove("rotate");
    }

    // Gets the weather icon that corresponds to the weather code.
    function getWeatherIcon(code, isDay) {
        switch (code) {
            case 1000:
                return isDay ? "sun-fill" : "moon-stars-fill";
            case 1003:
                return isDay ? "cloud-sun-fill" : "cloud-moon-fill";
            case 1006:
                return "cloudy-fill";
            case 1009:
                return "clouds-fill";
            case 1147:
            case 1135:
            case 1030:
                return "cloud-fog-fill";
            case 1240:
            case 1198:
            case 1186:
            case 1183:
            case 1180:
            case 1171:
            case 1168:
            case 1153:
            case 1150:
            case 1072:
            case 1063:
                return "cloud-drizzle-fill";
            case 1282:
            case 1279:
            case 1258:
            case 1255:
            case 1222:
            case 1219:
            case 1216:
            case 1213:
            case 1210:
            case 1114:
            case 1066:
                return "cloud-snow-fill";
            case 1252:
            case 1249:
            case 1207:
            case 1204:
            case 1069:
                return "cloud-sleet-fill";
            case 1087:
                return "cloud-lightning-fill";
            case 1243:
            case 1201:
            case 1192:
            case 1189:
                return "cloud-rain-fill";
            case 1246:
            case 1195:
                return "cloud-rain-heavy-fill";
            case 1117:
            case 1225:
                return "snow";
            case 1264:
            case 1261:
            case 1237:
                return "cloud-hail-fill";
            case 1276:
            case 1273:
                return "cloud-lightning-rain-fill";
            default:
                return "thermometer";
        }
    }

    // https://stackoverflow.com/a/40197728
    function convertTime12to24(time12h) {
        const [time, modifier] = time12h.split(" ");

        let [hours, minutes] = time.split(":");

        if (hours === "12") {
            hours = "00";
        }

        if (modifier === "PM") {
            hours = parseInt(hours, 10) + 12;
        }

        return `${hours}:${minutes}`;
    }

    // Adds a zero to the time (e.g "2024-01-01 8:50" => "2024-01-01 08:50") this is so that it works on Safari (-_-).
    function addZero(dateTime) {
        const [date, time] = dateTime.split(" ");

        let [hour, minute] = time.split(":");

        if (hour.length === 1) hour = `0${hour}`;

        if (minute.length === 1) minute = `0${minute}`;

        return `${date} ${hour}:${minute}`;
    }

    // Dom elements that will display the weather data.
    const loc = document.querySelector(".location");
    const date = document.querySelector(".date");
    const weatherIcon = document.querySelector(".weather-icon>svg");
    const temp = document.querySelector(".temp");
    const summary = document.querySelector(".summary");
    const feelsLike = document.querySelector(".feels-like");
    const windDirection = document.querySelector(".direction");
    const wind = document.querySelector(".wind>:last-child>.value");
    const pressure = document.querySelector(".pressure>.value");
    const humidity = document.querySelector(".humidity>.value");
    const cloud = document.querySelector(".cloud>.value");
    const visibility = document.querySelector(".visibility>.value");
    const uv = document.querySelector(".uv>.value");
    const rain = document.querySelector(".rain>.value");
    const sunrise = document.querySelector(".sunrise>.value");
    const sunset = document.querySelector(".sunset>.value");
    const air = document.querySelector(".air>.value");

    // Save the weather data.
    let currentWeatherData;

    // Decides whether to load currentWeatherData with imperial or metric units.
    let imperial = false;

    // Displays all the weather data.
    function displayWeatherData(weatherData) {
        currentWeatherData = weatherData || currentWeatherData;

        const {
            current,
            forecast: { forecastday },
            location,
        } = currentWeatherData;

        hideLoadingIcon();

        // Display the data that are not metric/imperial.
        loc.innerText = `${location.name}, ${location.country}`;
        summary.innerText = current.condition.text;
        humidity.innerText = `${current.humidity}%`;
        uv.innerText = current.uv;
        air.innerText = current.air_quality["us-epa-index"];
        windDirection.style.transform = `rotate(${current.wind_degree}deg)`;
        windDirection.title = `Wind direction ${current.wind_degree}°`;
        rain.innerText = `${forecastday[0].day.daily_chance_of_rain}%`;
        cloud.innerText = `${current.cloud}%`;
        weatherIcon.innerHTML = `<use xlink:href="./assets/images/bootstrap-icons/bootstrap-icons.svg#${getWeatherIcon(current.condition.code, current.is_day)}"/>`;

        const sunriseDate = new Date(
            `${forecastday[0].date} ${convertTime12to24(forecastday[0].astro.sunrise)}`,
        );
        const sunsetDate = new Date(
            `${forecastday[0].date} ${convertTime12to24(forecastday[0].astro.sunset)}`,
        );

        const localtime = new Date(addZero(location.localtime));

        // Display the data that are metric/imperial.
        if (imperial) {
            date.innerText = format(localtime, "EEEE MMMM do, hh:mm aaa");
            temp.innerText = `${current.temp_f}°`;
            feelsLike.innerText = `Feels like ${current.feelslike_f}°`;
            wind.innerText = `${current.wind_mph}mi/h`;
            pressure.innerText = `${current.pressure_in}in`;
            visibility.innerText = `${current.vis_miles}mi`;
            sunrise.innerText = format(sunriseDate, "hh:mm aaa");
            sunset.innerText = format(sunsetDate, "hh:mm aaa");
        } else {
            date.innerText = format(localtime, "EEEE MMMM do, HH:mm");
            temp.innerText = `${current.temp_c}°`;
            feelsLike.innerText = `Feels like ${current.feelslike_c}°`;
            wind.innerText = `${current.wind_kph}km/h`;
            pressure.innerText = `${current.pressure_mb}mb`;
            visibility.innerText = `${current.vis_km}km`;
            sunrise.innerText = format(sunriseDate, "HH:mm");
            sunset.innerText = format(sunsetDate, "HH:mm");
        }

        const todayForecast = document.querySelector(".today-forecast");
        const futureForecast = document.querySelector(".future-forecast");

        const currentHour = format(localtime, "HH");

        futureForecast.innerHTML = "";

        // Display futureForecast weather data.
        for (let i = 0; i < forecastday.length; i++) {
            const day = forecastday[i].day;

            futureForecast.innerHTML += `
                <div>
                    <div>
                        <div class="day">${i === 0 ? "Today" : format(new Date(forecastday[i].date), "EEEE")}</div>
                        <div class="icon" title="${day.condition.text}">
                            <svg
                                class="bi"
                                width="32"
                                height="32"
                                fill="currentColor"
                            >
                                <use
                                    xlink:href="./assets/images/bootstrap-icons/bootstrap-icons.svg#${getWeatherIcon(day.condition.code, true)}"
                                />
                            </svg>
                        </div>
                    </div>
                    <div>
                        <div class="low">
                            <div class="detail-title">Min</div>
                            <div class="value">${imperial ? day.mintemp_f : day.mintemp_c}°</div>
                        </div>
                        <div class="high">
                            <div class="detail-title">Max</div>
                            <div class="value">${imperial ? day.maxtemp_f : day.maxtemp_c}°</div>
                        </div>
                        <div class="rain">
                            <div class="detail-title">Rain</div>
                            <div class="value">${day.daily_chance_of_rain}%</div>
                        </div>
                    </div>
                </div>
                <hr>
            `;
        }

        todayForecast.innerHTML = "";

        const LIMIT = 24;
        let count = 0;

        // Display todayForecast weather data.
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < forecastday[i].hour.length; j++) {
                const hourData = forecastday[i].hour[j];
                const hour = format(new Date(hourData.time), "HH");
                const date = new Date(hourData.time);

                // Make sure not to exceed 24 hours.
                if (hour >= currentHour || isTomorrow(date)) {
                    if (count++ === LIMIT) return;

                    todayForecast.innerHTML += `
                        <div>
                            <div class="time-stamp">${hour === currentHour ? "Now" : format(date, imperial ? "hh:mm aaa" : "HH:mm")}</div>
                            <div class="icon" title="${hourData.condition.text}">
                                <svg
                                    class="bi"
                                    width="32"
                                    height="32"
                                    fill="currentColor"
                                >
                                    <use
                                        xlink:href="./assets/images/bootstrap-icons/bootstrap-icons.svg#${getWeatherIcon(hourData.condition.code, hourData.is_day)}"
                                    />
                                </svg>
                            </div>
                            <div class="temp">${imperial ? hourData.temp_f : hourData.temp_c}°</div>
                        </div>
                    `;
                }
            }
        }
    }

    const button = document.querySelector(".convert-unit");

    // Toggle between imperial and metric units.
    button.addEventListener("click", () => {
        imperial = imperial ? false : true;

        displayWeatherData();

        button.innerText = imperial ? "Metric" : "Imperial";
    });

    return { displayWeatherData, showLoadingIcon, hideLoadingIcon };
})();

const searchHandler = (() => {
    // Initialize event listeners and search for ip address.
    function init() {
        const autocompleteBox = document.querySelector(".autocomplete");
        const searchBox = document.querySelector("#search");
        const errorMessageBox = document.querySelector(".error");

        // Hide autocompleteBox when user clicks away.
        document.addEventListener("click", () => {
            autocompleteBox.innerHTML = "";
        });

        // Search weather with text or ID.
        function search(searchText) {
            displayController.showLoadingIcon();

            const value =
                isNaN(Number(searchText)) || searchText === ""
                    ? searchText
                    : Number(searchText);

            weather.getWeather(value).then(
                (resolve) => {
                    displayController.displayWeatherData(resolve);
                },
                (reject) => {
                    displayController.hideLoadingIcon();

                    // Show error message if the search failed.
                    errorMessageBox.innerText = reject;

                    // Hide the error message after 5 seconds.
                    setTimeout(() => {
                        errorMessageBox.innerText = "";
                    }, 5000);
                },
            );
        }

        // Search for the users ip on initial page load.
        search("auto:ip");

        document.querySelector("form").addEventListener("submit", (event) => {
            event.preventDefault();

            search(searchBox.value);
        });

        // Search when user clicks on a suggestion in the autocompleteBox.
        autocompleteBox.addEventListener("click", (event) => {
            searchBox.value = event.target.innerText;

            search(event.target.dataset.id);
        });

        // Provide search suggestions as the user types in the searchBox.
        searchBox.addEventListener("input", () => {
            autocompleteBox.innerHTML = "";

            weather.getAutocomplete(searchBox.value).then((results) => {
                for (let i = 0; i < results.length; i++) {
                    const suggestion = document.createElement("li");
                    suggestion.dataset.id = results[i].id;
                    suggestion.innerText = results[i].result;

                    autocompleteBox.appendChild(suggestion);
                }
            });
        });
    }

    return { init };
})();

export { searchHandler };
