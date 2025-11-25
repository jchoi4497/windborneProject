import { useEffect, useState } from "react";
import { getBalloonData } from "./api/balloons";
import BalloonGlobe from "./components/BalloonGlobe";

function App() {
  const [balloons, setBalloons] = useState(null);

  useEffect(() => {
    async function loadData() {
      const data = await getBalloonData();
      setBalloons(data || []);
      console.log("Frontend received:", data);
    }
    loadData();
    const intervalId = setInterval(loadData, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      {/* <h1>WindBorne Balloon Data</h1>
      {!balloons && <p>Loading...</p>}
      {balloons && <pre>{JSON.stringify(balloons, null, 2)}</pre>} */}
      <BalloonGlobe markers={balloons || []} />
    </div>
  );
}

export default App;
