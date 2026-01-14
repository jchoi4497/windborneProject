// src/api/weather.js
export async function getWeatherForBalloons(balloons) {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_ROUTE}/weather`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(balloons),
    });

    if (!res.ok) throw new Error("Weather function failed");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    // Fallback: return balloons with null weather
    return balloons.map((b) => ({ ...b, temperature: null, weather: null }));
  }
}
