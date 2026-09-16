interface Location {
    name: string;
    latitude: number;
    longitude: number;
    country: string;
}

interface Weather {
    temperature: number;
    windSpeed: number;
    windDirection: number;
    weatherCode: number;
}

interface NewsPost {
    id: number;
    title: string;
    body: string;
}

interface NewsResponse {
    posts: NewsPost[];
}


// GET CITY


function getCityCoordinates(city: string): Promise<Location> {

    const url =
        `https://geocoding-api.open-meteo.com/v1/search` +
        `?name=${encodeURIComponent(city)}` +
        `&count=1` +
        `&language=en` +
        `&format=json`;

    return fetch(url)
        .then((response) => {

            if (!response.ok) {
                throw new Error(
                    "Unable to contact the geocoding API."
                );
            }

            return response.json();
        })
        .then((data) => {

            if (!data.results || data.results.length === 0) {
                throw new Error(
                    `City "${city}" was not found.`
                );
            }

            const result = data.results[0];

            return {
                name: result.name,
                latitude: result.latitude,
                longitude: result.longitude,
                country: result.country
            };
        });
}


// GET WEATHER


function getWeather(
    latitude: number,
    longitude: number
): Promise<Weather> {

    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,wind_speed_10m,wind_direction_10m,weather_code` +
        `&timezone=auto`;

    return fetch(url)
        .then((response) => {

            if (!response.ok) {
                throw new Error(
                    "Unable to get weather information."
                );
            }

            return response.json();
        })
        .then((data) => {

            return {
                temperature: data.current.temperature_2m,
                windSpeed: data.current.wind_speed_10m,
                windDirection: data.current.wind_direction_10m,
                weatherCode: data.current.weather_code
            };
        });
}


// GET NEWS


function getNews(): Promise<NewsResponse> {

    return fetch("https://dummyjson.com/posts?limit=3")
        .then((response) => {

            if (!response.ok) {
                throw new Error(
                    "Unable to get news information."
                );
            }

            return response.json();
        });
}


// WEATHER DESCRIPTION


function getWeatherDescription(code: number): string {

    const descriptions: Record<number, string> = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        71: "Slight snow",
        73: "Moderate snow",
        75: "Heavy snow",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        95: "Thunderstorm",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail"
    };

    return descriptions[code] ?? "Unknown weather";
}


// DISPLAY


function displayDashboard(
    location: Location,
    weather: Weather,
    news: NewsResponse
): void {

    console.log("\n========================================");
    console.log("       ASYNC WEATHER & NEWS DASHBOARD");
    console.log("========================================");

    console.log("\nWEATHER");
    console.log("----------------------------------------");
    console.log(`Location: ${location.name}, ${location.country}`);
    console.log(`Temperature: ${weather.temperature}°C`);
    console.log(`Conditions: ${getWeatherDescription(weather.weatherCode)}`);
    console.log(`Wind Speed: ${weather.windSpeed} km/h`);
    console.log(`Wind Direction: ${weather.windDirection}°`);

    console.log("\nLATEST NEWS");
    console.log("----------------------------------------");

    news.posts.forEach((post, index) => {
        console.log(`${index + 1}. ${post.title}`);
    });

    console.log("\n========================================");
}


// TERMINAL INPUT


function askCity(): Promise<string> {

    return new Promise((resolve) => {

        process.stdout.write("Enter city: ");

        process.stdin.once("data", (data) => {
            resolve(data.toString().trim());
        });
    });
}


// MAIN PROMISE PROGRAM


async function main(): Promise<void> {

    console.log("\n========================================");
    console.log("        PROMISE WEATHER & NEWS");
    console.log("========================================\n");

    const city = await askCity();

    if (!city) {
        console.error("\nPlease enter a city name.\n");
        return;
    }

    console.log(`\nSearching for ${city}...\n`);


    // 1. PROMISE CHAINING


    getCityCoordinates(city)
        .then((location) => {

            console.log(
                `Found: ${location.name}, ${location.country}`
            );

            return getWeather(
                location.latitude,
                location.longitude
            );
        })
        .then((weather) => {

            console.log(
                `Weather fetched: ${weather.temperature}°C`
            );

            return getNews();
        })
        .then((news) => {

            console.log(
                `News fetched: ${news.posts.length} headlines`
            );

            console.log(
                "\nPromise chaining completed successfully."
            );
        })
        .catch((error: unknown) => {

            if (error instanceof Error) {
                console.error(
                    `\nChain Error: ${error.message}`
                );
            }
        });


    // 2. PROMISE.ALL()
    

    try {

        const location = await getCityCoordinates(city);

        const weatherPromise = getWeather(
            location.latitude,
            location.longitude
        );

        const newsPromise = getNews();

        const [weather, news] = await Promise.all([
            weatherPromise,
            newsPromise
        ]);

        console.log("\n========================================");
        console.log("           Promise.all()");
        console.log("========================================");

        console.log(
            "Weather and news were requested concurrently."
        );

        displayDashboard(
            location,
            weather,
            news
        );

    } catch (error: unknown) {

        if (error instanceof Error) {
            console.error(
                `\nPromise.all Error: ${error.message}`
            );
        }
    }


    // 3. PROMISE.RACE()


    try {

        const location = await getCityCoordinates(city);

        const weatherPromise = getWeather(
            location.latitude,
            location.longitude
        ).then((weather) => ({
            type: "Weather",
            data: weather
        }));

        const newsPromise = getNews()
            .then((news) => ({
                type: "News",
                data: news
            }));

        const fastest = await Promise.race([
            weatherPromise,
            newsPromise
        ]);

        console.log("\n========================================");
        console.log("           Promise.race()");
        console.log("========================================");

        console.log(
            `Fastest response came from: ${fastest.type}`
        );

    } catch (error: unknown) {

        if (error instanceof Error) {
            console.error(
                `\nPromise.race Error: ${error.message}`
            );
        }
    }

    console.log("\nPromise Version Completed.\n");
}

main();