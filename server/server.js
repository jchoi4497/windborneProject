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
      let latitude = first24[i][0];
      let longitude = first24[i][1];
      let altitude = first24[i][2];
      let hour = i;
      console.log(
        `Hours Ago ${i}: lat=${latitude}, lon=${longitude}, alt=${altitude}`
      );

      if (latitude === null || longitude === null || altitude === null) {
        console.warn(`Data for ${i} hours ago corrupted`, first24[i]);
        continue;
      }

      formattedBalloons.push({
        lat: latitude,
        lng: longitude,
        altitude: altitude / 10000 || 0.02,
        color: "#ffffff",
        city: `Hours Ago ${i}`,
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

//check if it has length for 3 !first24
// Websocket, setInterval, long polling
