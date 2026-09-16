import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

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


// CITY LOOKUP


async function getCityCoordinates(
    city: string
): Promise<Location> {

    const url =
        `https://geocoding-api.open-meteo.com/v1/search` +
        `?name=${encodeURIComponent(city)}` +
        `&count=1` +
        `&language=en` +
        `&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            "Unable to contact the geocoding API."
        );
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error(
            `City "${city}" could not be found.`
        );
    }

    const result = data.results[0];

    return {
        name: result.name,
        latitude: result.latitude,
        longitude: result.longitude,
        country: result.country
    };
}


// WEATHER


async function getWeather(
    latitude: number,
    longitude: number
): Promise<Weather> {

    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,wind_speed_10m,wind_direction_10m,weather_code` +
        `&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            "Unable to retrieve weather information."
        );
    }

    const data = await response.json();

    return {
        temperature: data.current.temperature_2m,
        windSpeed: data.current.wind_speed_10m,
        windDirection: data.current.wind_direction_10m,
        weatherCode: data.current.weather_code
    };
}


// NEWS


async function getNews(): Promise<NewsResponse> {

    const response = await fetch(
        "https://dummyjson.com/posts?limit=3"
    );

    if (!response.ok) {
        throw new Error(
            "Unable to retrieve news information."
        );
    }

    return await response.json();
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


// DISPLAY DASHBOARD


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

    console.log(
        `Location: ${location.name}, ${location.country}`
    );

    console.log(
        `Temperature: ${weather.temperature}°C`
    );

    console.log(
        `Conditions: ${getWeatherDescription(weather.weatherCode)}`
    );

    console.log(
        `Wind Speed: ${weather.windSpeed} km/h`
    );

    console.log(
        `Wind Direction: ${weather.windDirection}°`
    );

    console.log("\nLATEST NEWS");
    console.log("----------------------------------------");

    news.posts.forEach((post, index) => {
        console.log(`${index + 1}. ${post.title}`);
    });

    console.log("\n========================================");
    console.log("       Async/Await Version Completed");
    console.log("========================================\n");
}


// MAIN ASYNC/AWAIT APPLICATION


async function main(): Promise<void> {

    const rl = readline.createInterface({
        input,
        output
    });

    try {

        console.log("\n========================================");
        console.log("       WEATHER & NEWS DASHBOARD");
        console.log("========================================\n");

        const city = (
            await rl.question("Enter city: ")
        ).trim();

        if (!city) {
            console.error("\nPlease enter a city name.\n");
            return;
        }

        console.log(
            `\nFetching weather and news for ${city}...\n`
        );

       
        // STEP 1: FIND CITY
       

        const location = await getCityCoordinates(city);

        console.log(
            `Location found: ${location.name}, ${location.country}`
        );


        // STEP 2: FETCH WEATHER plus NEWS
        // USING PROMISE.ALL()

        console.log(
            "\nFetching weather and news simultaneously..."
        );

        const weatherPromise = getWeather(
            location.latitude,
            location.longitude
        );

        const newsPromise = getNews();

        const [weather, news] = await Promise.all([
            weatherPromise,
            newsPromise
        ]);

        console.log(
            "Weather and news requests completed."
        );

       
        // STEP 3: DISPLAY RESULTS
       

        displayDashboard(
            location,
            weather,
            news
        );

       
        // STEP 4: PROMISE.RACE()
       

        console.log("Testing Promise.race()...");

        const fastest = await Promise.race([
            getWeather(
                location.latitude,
                location.longitude
            ).then(() => "Weather API"),

            getNews().then(() => "News API")
        ]);

        console.log(
            `Fastest API response: ${fastest}`
        );

        console.log(
            "\nAsync/Await application completed successfully."
        );

    } catch (error: unknown) {

        if (error instanceof Error) {

            console.error(
                `\nDashboard Error: ${error.message}`
            );

        } else {

            console.error(
                "\nAn unexpected error occurred."
            );
        }

    } finally {

        rl.close();
    }
}

main();