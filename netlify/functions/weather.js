export async function handler(event) {
  try {
    const balloons = event.body;
    const apiKey = process.env.VITE_APP_WINDBORNE_WEATHER_API_KEY;

    const results = await Promise.all(
      balloons.map(async (b) => {
        try {
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${b.lat}&lon=${b.lng}&units=metric&appid=${apiKey}`
          );
          if (!res.ok) throw new Error("Weather API failed");
          const data = await res.json();

          return {
            ...b,
            temperature: data.main.temp,
            weather: data.weather[0].main,
          };
        } catch {
          return { ...b, temperature: null, weather: null };
        }
      })
    );

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
