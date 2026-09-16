const weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=-23.9045&longitude=29.4688&current_weather=true';
const newsUrl = 'https://dummyjson.com/posts?limit=3';

async function fetchDashboardData() { 

    try { 
        // fetch weather and make it PAUSE execution of this function until it finishes

        const weatherResponse = await fetch(weatherUrl);
        const weather = await weatherResponse.json();
         console.log(`Weather Fetched: ${weather.current_weather.temperature}°C`);

        // fetch news and make it PAUSE execution of this function until it finishes
        const newsResponse = await fetch(newsUrl);
        const news = await newsResponse.json();
        console.log(`News Fetched: ${news.posts[0].title}`);

        console.log("\nRunning Promise.all with await...");
        const [weatherRes, newsRes] = await Promise.all([
            fetch(weatherUrl).then(res => res.json),
            fetch(newsUrl).then(res => res.json)
        ]);

        console.log("Both finished simultaneously!");



    } catch(err) { 
        console.error("Dashboard Error:", err);
    }
}

fetchDashboardData();