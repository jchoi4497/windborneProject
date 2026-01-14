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

    for (let i = 0; i < first24.length; i++) {
      const latitude = first24[i][0];
      const longitude = first24[i][1];
      const altitude = first24[i][2];
      const hour = i;

      if (latitude === null || longitude === null || altitude === null) {
        console.warn(`Data for ${i} hours ago corrupted`, first24[i]);
        continue;
      }

      formattedBalloons.push({
        lat: latitude,
        lng: longitude,
        altitude: altitude / 10000,
        hour,
      });
    }

    res.json(formattedBalloons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch data" });
  }
});

app.post("/weather", async (req, res) => {
  const balloons = req.body;
  const apiKey = process.env.VITE_APP_WINDBORNE_WEATHER_API_KEY;
  const results = [];

  try {
    for (const b of balloons) {
      try {
        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${b.lat}&lon=${b.lng}&units=metric&appid=${apiKey}`
        );

        if (!weatherRes.ok) throw new Error("Weather API failed");
        const data = await weatherRes.json();

        results.push({
          ...b,
          temperature: data.main.temp,
          weather: data.weather[0].main,
        });

        // This 500ms pause keeps you under the 60 RPM limit
        await sleep(500);
      } catch (err) {
        results.push({ ...b, temperature: null, weather: null });
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
