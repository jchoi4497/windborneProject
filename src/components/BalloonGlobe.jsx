import { useEffect, useRef } from "react";
import ReactGlobe from "react-globe.gl";
import * as THREE from "three";

export default function BalloonGlobe({ markers, loading }) {
  const globeRef = useRef();

  // Show pop up when data unavailable
  useEffect(() => {
    if (!loading && (!markers || markers.length === 0)) {
      alert("Balloon data is currently unavailable");
    }
  }, [loading]);

  // Add clouds to globe
  useEffect(() => {
    if (!globeRef.current) return;

    const globe = globeRef.current;

    new THREE.TextureLoader().load(
      "https://unpkg.com/three-globe@2.37.0/example/clouds/clouds.png",
      (texture) => {
        const cloudsGeometry = new THREE.SphereGeometry(
          globe.getGlobeRadius() + 1.5,
          75,
          75
        );
        const cloudsMaterial = new THREE.MeshLambertMaterial({
          map: texture,
          transparent: true,
          opacity: 0.4,
        });
        const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
        globe.scene().add(clouds);

        // ANIMATE CLOUDS
        function animateClouds() {
          clouds.rotation.y += 0.0001; // adjust speed here
          requestAnimationFrame(animateClouds);
        }
        animateClouds();
      }
    );
  }, [globeRef]);

  const getPointColor = (data) => {
    if (!data.temperature) return "orange"; // default
    if (data.temperature <= 0) return "lightblue";
    if (data.temperature <= 15) return "cyan";
    if (data.temperature <= 25) return "yellow";
    return "red";
  };

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ReactGlobe
        ref={globeRef}
        pointsData={markers || []}
        pointLabel={(data) => `
            ${data.hour} Hours Ago
            <br/>
            Longitude: ${data.lat}
            <br/>
            Latitude: ${data.lng}
            <br/>
            Altitude: ${data.altitude}
            <br/>
            Temperature: ${data.temperature ?? "N/A"} °C
            <br/>
            Weather: ${data.weather ?? "Unknown"}
          `}
        pointLat={(data) => data.lat}
        pointLng={(data) => data.lng}
        pointColor={(data) => getPointColor(data)}
        pointAltitude={(data) => data.altitude}
        pointRadius={0.9}
        globeImageUrl="https://unpkg.com/three-globe@2.27.4/example/img/earth-day.jpg"
        backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png" // 🌟 stars background
        atmosphereColor="skyblue"
        atmosphereAltitude={0.2}
      />
    </div>
  );
}
