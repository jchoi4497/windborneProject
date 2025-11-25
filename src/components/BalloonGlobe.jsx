import { useState, useEffect, useRef } from "react";
import ReactGlobe from "react-globe.gl";
import { getBalloonData } from "../api/balloons";

export default function BalloonGlobe({}) {
  const globeRef = useRef();
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    async function loadMarkers() {
      const data = await getBalloonData();
      if (!data) return;

      setMarkers(data);
    }
    loadMarkers();
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ReactGlobe
        ref={globeRef}
        pointsData={markers}
        pointLat={(data) => data.lat}
        pointLng={(data) => data.lng}
        pointColor={(data) => data.color}
        pointAltitude={(data) => data.altitude}
        pointRadius={0.5}
        globeImageUrl="https://unpkg.com/three-globe@2.27.4/example/img/earth-day.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png" // 🌟 stars background
        atmosphereColor="skyblue"
        atmosphereAltitude={0.15}
        globeCloudsUrl="https://unpkg.com/three-globe/example/img/earth-clouds.png"
        cloudsOpacity={0.4}
        cloudsSpeed={0.01}
      />
    </div>
  );
}
