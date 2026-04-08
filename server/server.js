import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const BALLOON_URL = "https://a.windbornesystems.com/treasure/00.json";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Allow requests from any origin (for dev)
app.use(cors());
app.use(express.json());

app.get("/balloons", async (req, res) => {
  try {
    const response = await fetch(BALLOON_URL);
    if (!response.ok) throw new Error(`Failed to fetch ${BALLOON_URL}`);
    const data = await response.json();
    // Return only the first 24 items
    const first24 = data.slice(0, 24);
    const formattedBalloons = [];
    const corruptedCount = [];

    for (let i = 0; i < first24.length; i++) {
      const latitude = first24[i][0];
      const longitude = first24[i][1];
      const altitude = first24[i][2];
      const hour = i;

      if (latitude === null || longitude === null || altitude === null) {
        console.warn(`Data for ${i} hours ago corrupted`, first24[i]);
        corruptedCount.push(i);
        continue;
      }

      formattedBalloons.push({
        lat: latitude,
        lng: longitude,
        altitude: altitude / 10000,
        hour,
      });
    }

    // Include metadata about corrupt data
    res.json({
      balloons: formattedBalloons,
      metadata: {
        total: first24.length,
        valid: formattedBalloons.length,
        corrupted: corruptedCount.length,
        corruptedHours: corruptedCount,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch data" });
  }
});

async function fetchWeatherWithRetry(lat, lng, apiKey, maxRetries = 2) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`
      );

      // Check for rate limit error
      if (weatherRes.status === 429) {
        throw new Error("RATE_LIMIT");
      }

      // Check for other HTTP errors
      if (!weatherRes.ok) {
        throw new Error(`API returned status ${weatherRes.status}`);
      }

      const data = await weatherRes.json();

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

app.post("/weather", async (req, res) => {
  const balloons = req.body;
  const apiKey = process.env.VITE_APP_WINDBORNE_WEATHER_API_KEY;
  const results = [];

  try {
    for (let i = 0; i < balloons.length; i++) {
      const b = balloons[i];
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
      if (i < balloons.length - 1) {
        await sleep(1000);
      }
    }
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch weather data" });
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
