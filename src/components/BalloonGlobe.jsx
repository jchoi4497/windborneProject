import { useEffect, useRef } from "react";
import ReactGlobe from "react-globe.gl";
import * as THREE from "three";

export default function BalloonGlobe({ markers, loading, error, metadata }) {
  const globeRef = useRef();

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
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {/* Status Banner */}
      {(error || metadata?.corrupted > 0 || (!loading && markers?.length === 0)) && (
        <div
          style={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            padding: "12px 24px",
            borderRadius: "8px",
            backgroundColor: error
              ? "rgba(220, 38, 38, 0.95)"
              : markers?.length === 0
              ? "rgba(234, 179, 8, 0.95)"
              : "rgba(59, 130, 246, 0.95)",
            color: "white",
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
            maxWidth: "90%",
          }}
        >
          {error ? (
            <div>
              <strong>⚠️ Connection Error:</strong> {error}
              <br />
              <small>
                Make sure your server is running on{" "}
                {import.meta.env.VITE_API_ROUTE || "localhost:3000"}
              </small>
            </div>
          ) : markers?.length === 0 ? (
            <div>
              <strong>🎈 No Balloons in Flight</strong>
              <br />
              <small>Waiting for balloon data to become available...</small>
            </div>
          ) : metadata?.corrupted > 0 ? (
            <div>
              <strong>ℹ️ Partial Data:</strong> Showing {metadata.valid} of{" "}
              {metadata.total} balloons
              <br />
              <small>
                {metadata.corrupted} balloon{metadata.corrupted > 1 ? "s" : ""}{" "}
                had corrupted data (hours:{" "}
                {metadata.corruptedHours.join(", ")})
              </small>
            </div>
          ) : null}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            padding: "20px 40px",
            borderRadius: "8px",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            fontFamily: "Arial, sans-serif",
            fontSize: "16px",
          }}
        >
          Loading balloon data...
        </div>
      )}

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
