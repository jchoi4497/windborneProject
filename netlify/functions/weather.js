const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWeatherWithRetry(lat, lng, apiKey, maxRetries = 2) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`
      );

      // Check for rate limit error
      if (res.status === 429) {
        throw new Error("RATE_LIMIT");
      }

      // Check for other HTTP errors
      if (!res.ok) {
        throw new Error(`API returned status ${res.status}`);
      }

      const data = await res.json();

      // Validate response has required fields
      if (!data.main || !data.weather) {
        throw new Error("Invalid API response structure");
      }

      return {
        success: true,
        data: {
          temperature: data.main.temp,
          feelsLike: data.main.feels_like,
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          weather: data.weather[0].main,
          description: data.weather[0].description,
          windSpeed: data.wind?.speed || null,
          windDeg: data.wind?.deg || null,
          clouds: data.clouds?.all || null,
        },
      };
    } catch (err) {
      // If rate limited, wait longer before retry
      if (err.message === "RATE_LIMIT" && attempt < maxRetries - 1) {
        await sleep(2000 * (attempt + 1)); // Exponential backoff: 2s, 4s
        continue;
      }

      // If last attempt or other error, return failure
      if (attempt === maxRetries - 1) {
        return {
          success: false,
          error: err.message,
        };
      }

      // Retry with exponential backoff
      await sleep(1000 * (attempt + 1));
    }
  }
}

export async function handler(event) {
  try {
    const balloons = JSON.parse(event.body);
    const apiKey = process.env.VITE_APP_WINDBORNE_WEATHER_API_KEY;
    const results = [];

    // We only do the first 8 to avoid the 10-second Netlify timeout
    const limitedBalloons = balloons.slice(0, 8);

    for (let i = 0; i < limitedBalloons.length; i++) {
      const b = limitedBalloons[i];
      const weatherResult = await fetchWeatherWithRetry(b.lat, b.lng, apiKey);

      if (weatherResult.success) {
        results.push({
          ...b,
          ...weatherResult.data,
        });
      } else {
        results.push({
          ...b,
          temperature: null,
          feelsLike: null,
          humidity: null,
          pressure: null,
          weather: null,
          description: null,
          windSpeed: null,
          windDeg: null,
          clouds: null,
          error: weatherResult.error,
        });
      }

      // Wait 1 second between requests to stay under 60 RPM limit
      // Skip delay after last request
      if (i < limitedBalloons.length - 1) {
        await sleep(1000);
      }
    }

    // 2. Take the balloons from index 8 to 24 (the ones we skipped)
    const remainingBalloons = balloons.slice(8).map((b) => ({
      ...b,
      temperature: null, // No weather for these to save time
      weather: null,
    }));

    // 3. Combine them so you have the full 24 again
    const finalData = [...results, ...remainingBalloons];

    return {
      statusCode: 200,
      body: JSON.stringify(finalData),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
