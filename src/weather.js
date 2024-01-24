const weather = (() => {
    const API_KEY = "9d7c90b5413f4c84a9e94558241001";
    const BASE_URL = "https://api.weatherapi.com/v1";

    async function getAutocomplete(text) {
        try {
            const response = await fetch(
                `${BASE_URL}/search.json?key=${API_KEY}&q=${text}`,
                { mode: "cors" },
            );
            const responseData = await response.json();

            // Return suggestions array.
            return responseData.map(({ id, name, region, country }) => {
                return {
                    id,
                    result: `${name}. ${region ? `${region}.` : ""} ${country}`,
                };
            });
        } catch {
            // Return an empty suggestions array.
            return [];
        }
    }

    async function getWeather(value) {
        let response;

        try {
            response = await fetch(
                `${BASE_URL}/forecast.json?key=${API_KEY}&q=${typeof value === "number" ? "id:" : ""}${value}&days=3&aqi=yes`,
                { mode: "cors" },
            );
        } catch {
            // Return a rejected promise if fetch failed.
            return Promise.reject("Network error.");
        }

        const responseData = await response.json();

        // Return a rejected promise if the no location was found.
        if (Object.prototype.hasOwnProperty.call(responseData, "error")) {
            return Promise.reject("Couldn't find Location.");
        }

        return responseData;
    }

    return { getAutocomplete, getWeather };
})();

export { weather };
