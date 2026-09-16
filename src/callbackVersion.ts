import https from 'https';
import readLine from 'readline';


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


function askQuestion(question: string, callback: (answer : string) => void): void {
    const rl = readLine.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(question, (answer) => { 
        rl.close();
        callback(answer.trim());
    })
}

// Get data using callbacks

function getCityCoordinates(city: string, callback: (error: Error | null, location?: Location) => void): void {

    const url = `https://geocoding-api.open-meteo.com/v1/search` +
        `?name=${encodeURIComponent(city)}` +
        `&count=1` +
        `&language=en` +
        `&format=json`;
    
    
    https.get(url, (response) => {

        let data = "";

        response.on("data", (chunk: Buffer) => {
            data += chunk.toString();
        });

        response.on("end", () => {

            try {
                const result = JSON.parse(data);

                if (!result.results || result.results.length === 0) {
                    callback(new Error(`City "${city}" was not found.`));
                    return;
                }

                const cityData = result.results[0];

                const location: Location = {
                    name: cityData.name,
                    latitude: cityData.latitude,
                    longitude: cityData.longitude,
                    country: cityData.country
                };

                callback(null, location);

            } catch {
                callback(new Error("Invalid response from the geocoding API."));
            }
        });

    }).on("error", (error) => {
        callback(error);
    });
}
 
function getWeather(
    latitude: number,
    longitude: number,
    callback: (error: Error | null, weather?: Weather) => void
): void {

    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,wind_speed_10m,wind_direction_10m,weather_code` +
        `&timezone=auto`;

    https.get(url, (response) => {

        let data = "";

        response.on("data", (chunk: Buffer) => {
            data += chunk.toString();
        });

        response.on("end", () => {

            try {
                const result = JSON.parse(data);

                const weather: Weather = {
                    temperature: result.current.temperature_2m,
                    windSpeed: result.current.wind_speed_10m,
                    windDirection: result.current.wind_direction_10m,
                    weatherCode: result.current.weather_code
                };

                callback(null, weather);

            } catch {
                callback(new Error("Invalid response from the weather API."));
            }
        });

    }).on("error", (error) => {
        callback(error);
    });
}

function getNews(
    callback: (error: Error | null, news?: NewsResponse) => void
): void {

    const url = "https://dummyjson.com/posts?limit=3";

    https.get(url, (response) => {

        let data = "";

        response.on("data", (chunk: Buffer) => {
            data += chunk.toString();
        });

        response.on("end", () => {

            try {
                const news: NewsResponse = JSON.parse(data);

                callback(null, news);

            } catch {
                callback(new Error("Invalid response from the news API."));
            }
        });

    }).on("error", (error) => {
        callback(error);
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
    console.log("       Callback Version Completed");
    console.log("========================================\n");
}


// MAIN PROGRAM

console.log("\n========================================");
console.log("       CALLBACK WEATHER & NEWS");
console.log("========================================\n");

askQuestion("Enter city: ", (city) => {

    if (!city) {
        console.error("\nPlease enter a city name.\n");
        return;
    }

    console.log(`\nFetching weather for ${city}...`);

    // CALLBACK HELL:
    // City → Weather → News → Display

    getCityCoordinates(city, (locationError, location) => {

        if (locationError || !location) {
            console.error(`\nError: ${locationError?.message}\n`);
            return;
        }

        console.log(
            `Found: ${location.name}, ${location.country}`
        );

        getWeather(
            location.latitude,
            location.longitude,
            (weatherError, weather) => {

                if (weatherError || !weather) {
                    console.error(
                        `\nWeather Error: ${weatherError?.message}\n`
                    );
                    return;
                }

                console.log("Weather fetched successfully.");

                // Nested callback demonstrates callback hell
                getNews((newsError, news) => {

                    if (newsError || !news) {
                        console.error(
                            `\nNews Error: ${newsError?.message}\n`
                        );
                        return;
                    }

                    console.log("News fetched successfully.");

                    displayDashboard(
                        location,
                        weather,
                        news
                    );
                });
            }
        );
    });
});






























