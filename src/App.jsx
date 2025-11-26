import { useEffect, useState } from "react";
import { getWeatherForBalloons } from "./api/weather";
import BalloonGlobe from "./components/BalloonGlobe";

function App() {
  const [balloons, setBalloons] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch balloon data from Netlify function
        const res = await fetch("/.netlify/functions/balloons");
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
      } catch (err) {
        console.error("Error loading balloons:", err);
        setBalloons([]);
      }
    }

    // async function loadData() {
    //   const data = await getBalloonData();
    //   let balloonsWeather = [];
    //   if (data && data.length > 0) {
    //     balloonsWeather = await getWeatherForBalloons(data);
    //   }
    //   setBalloons(balloonsWeather);
    //   console.log("Frontend received:", balloonsWeather);
    // }
    loadData();
    const intervalId = setInterval(loadData, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <BalloonGlobe markers={balloons || []} />
    </div>
  );
}

export default App;
