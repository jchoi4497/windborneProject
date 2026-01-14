export async function handler(event) {
  try {
    const balloons = JSON.parse(event.body);
    const apiKey = process.env.VITE_APP_WINDBORNE_WEATHER_API_KEY;

    const results = [];

    // We only do the first 8 to avoid the 10-second Netlify timeout
    const limitedBalloons = balloons.slice(0, 8);

    for (const b of limitedBalloons) {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${b.lat}&lon=${b.lng}&units=metric&appid=${apiKey}`
        );
        const data = await res.json();

        results.push({
          ...b,
          temperature: data?.main?.temp || null,
          weather: data?.weather?.[0]?.main || null,
        });
      } catch (err) {
        results.push({ ...b, temperature: null, weather: null });
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(results),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
