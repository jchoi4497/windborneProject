// src/api/weather.js
export async function getWeatherForBalloons(balloons) {
  const apiKey = "3c85f19fa20ceca2425d36db7c0e8850";

  return Promise.all(
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
}
