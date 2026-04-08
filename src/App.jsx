import { useEffect, useState } from "react";
import { getWeatherForBalloons } from "./api/weather";
import BalloonGlobe from "./components/BalloonGlobe";

function App() {
  const [balloons, setBalloons] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);

  async function loadData() {
    try {
      setError(null);
      // Fetch balloon data from Netlify function
      const res = await fetch(`${import.meta.env.VITE_API_ROUTE}/balloons`);
      if (!res.ok) throw new Error("Failed to fetch balloon data");
      const data = await res.json();

      // Handle new response format with metadata
      let balloonData = [];
      let meta = null;

      if (data.balloons) {
        // New format with metadata
        balloonData = data.balloons;
        meta = data.metadata;
        setMetadata(meta);
      } else {
        // Old format (array)
        balloonData = data;
      }

      // Optionally fetch weather for balloons
      let balloonsWeather = [];

      if (balloonData && balloonData.length > 0) {
        balloonsWeather = await getWeatherForBalloons(balloonData);
      } else {
        balloonsWeather = [];
      }

      setBalloons(balloonsWeather);
    } catch (err) {
      console.error("Error loading balloons:", err);
      setError(err.message);
      setBalloons([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    const intervalId = setInterval(loadData, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <BalloonGlobe
        markers={balloons || []}
        loading={loading}
        error={error}
        metadata={metadata}
      />
    </div>
  );
}

export default App;
