import { useEffect, useState } from "react";
import { getBalloonData } from "./api/balloons";
import { getWeatherForBalloons } from "./api/weather";
import BalloonGlobe from "./components/BalloonGlobe";

function App() {
  const [balloons, setBalloons] = useState(null);

  useEffect(() => {
    async function loadData() {
      const data = await getBalloonData();
      let balloonsWeather = [];
      if (data && data.length > 0) {
        balloonsWeather = await getWeatherForBalloons(data);
      }
      setBalloons(balloonsWeather);
      console.log("Frontend received:", balloonsWeather);
    }
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
