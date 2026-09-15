import https from 'https';

//Polokwanne Coordinates are used here
const weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=-23.9045&longitude=29.4688&current_weather=true';
const newsUrl = 'https://dummyjson.com/posts?limit=3';

console.log("--- Starting Callback Version ---");

//1. Fetch weather data
https.get(weatherUrl, (weatherRes:any) => {
    let weatherData = '';

    weatherRes.on('data', (chunk:any) => {
        weatherData += chunk;
    });

    weatherRes.on('end', () => {
        const weather = JSON.parse(weatherData);
        console.log("Weather fetched successfully");
        console.log(`Current Temp: ${weather.current_weather.temperature}°C`);


        //2. Fetch news data inside the weather callback to ensure sequential execution (callback hell)
        https.get(newsUrl, (newsRes: any) => {
            let newsData = '';

            newsRes.on('data', (chunk: any) => {
                newsData += chunk;
            });

            newsRes.on('end', () => {
                const news = JSON.parse(newsData);
                console.log("News fetched successfully");
                console.log(`Headline 1: ${news.posts[0].title}`);
                console.log("--- Callback Version Completed ---");
            });

        }).on('error', (err: any) => {
            console.log("Error fetching news data: " + err.message);
        });

    }).on('error', (err: any) => { 
        console.error("Error fetching weather data: " + err.message);
    });

 });



