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
        markers={markers}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png" // 🌟 stars
        ref={globeRef}
        options={{
          enableMarkerTooltip: true,
          markerEnterAnimationDuration: 2000,
          markerExitAnimationDuration: 2000,
          markerRadiusScaleRange: [0.02, 0.05],
          markerTooltipRenderer: (marker) =>
            `${marker.city} (Altitude: ${marker.altitude.toFixed(2)})`,
        }}
        // pointLat={(data) => data.latitude}
        // pointLng={(data) => data.longitude}
        // pointAltitude={(data) => data.altitude}
        // pointRadius={0.2}
        // globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        // bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        // backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png" // 🌟 stars background
        // atmosphereColor="skyblue"
        // atmosphereAltitude={0.15}
      />
    </div>
  );
}
