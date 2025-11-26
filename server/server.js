import express from "express";
import cors from "cors";

const app = express();
const PORT = 3000;
const BALLOON_URL = "https://a.windbornesystems.com/treasure/00.json";

// Allow requests from any origin (for dev)
app.use(cors());

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
    console.log("Formatted balloons:", formattedBalloons.length);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch data" });
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
