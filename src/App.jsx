import { useEffect, useState } from "react";
import { getWeatherForBalloons } from "./api/weather";
import BalloonGlobe from "./components/BalloonGlobe";

function App() {
  const [balloons, setBalloons] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      // Fetch balloon data from Netlify function
      const res = await fetch(`${import.meta.env.VITE_API_ROUTE}/balloons`);
      if (!res.ok) throw new Error("Failed to fetch balloon data");
      const data = await res.json();

      // Optionally fetch weather for balloons
      let balloonsWeather = [];

      if (data && data.length > 0) {
        balloonsWeather = await getWeatherForBalloons(data);
      } else {
        balloonsWeather = [];
      }

      setBalloons(balloonsWeather);
      setLoading(false);
    } catch (err) {
      console.error("Error loading balloons:", err);
      setBalloons([]);
    }
  }

  useEffect(() => {
    loadData();
    const intervalId = setInterval(loadData, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <BalloonGlobe markers={balloons || []} loading={loading} />
    </div>
  );
}

export default App;
