
const weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=-23.9045&longitude=29.4688&current_weather=true';
const newsUrl = 'https://dummyjson.com/posts?limit=3';

console.log("--- Starting Promise Version ---");

// 1. Sequential Chaining of Promises to fetch weather and news data

fetch(weatherUrl).then(res => res.json()).then(weather => { 
    console.log(`Weather: ${weather.current_weather.temperature}°C`);

    // Return the next promise to chain
    return fetch(newsUrl);
}).then(res => res.json()).then(news => { 
    console.log(`News Headline 1: ${news.posts[0].title}`);
})
    .catch(err => console.error("Chain Error: " + err.message))
    .finally(() => console.log("--- Starting Promise Version Combinators ---"));

// 2. Using Promise.all to fetch weather and news data concurrently
const weatherPromise = fetch(weatherUrl).then(res => res.json());
const newsPromise = fetch(newsUrl).then(res => res.json());

Promise.all([weatherPromise, newsPromise]).then(([weatherData, newsData]) => {
    console.log("\nPromise.all() complete!");
    console.log(`Temp: ${weatherData.current_weather.temperature}°C | News: ${newsData.posts[0].title}`)
})
    .catch(err => console.error("Promise.all Error:", err));

// 3. To get the fastest response
Promise.race([weatherPromise, newsPromise]).then(fastestResponse => { 
    console.log("\nPromise.race() complete!");

    // Response can be weather depending on which one response first (fastest)
    console.log("Fastest API returned data:", fastestResponse)

}).catch(err => console.error("Promise.race Error", err)
);
