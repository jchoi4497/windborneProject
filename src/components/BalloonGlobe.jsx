import { useState, useEffect, useRef } from "react";
import ReactGlobe from "react-globe.gl";
import * as THREE from "three";
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

  useEffect(() => {
    if (!globeRef.current) return;

    const globe = globeRef.current;

    // ADD CLOUDS
    new THREE.TextureLoader().load(
      "https://unpkg.com/three-globe@2.37.0/example/clouds/clouds.png",
      (texture) => {
        const cloudsGeometry = new THREE.SphereGeometry(
          globe.getGlobeRadius() + 1,
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
        backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png" // 🌟 stars background
        atmosphereColor="skyblue"
        atmosphereAltitude={0.25}
      />
    </div>
  );
}
