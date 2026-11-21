import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';

export default function OrbitalGlobe({ satellites }) {
  const globeRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    
    setTimeout(updateDimensions, 150);
    window.addEventListener('resize', updateDimensions);
    
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: 20.59, lng: 78.96, altitude: 2.2 }, 1000);
      
      const globeMaterial = globeRef.current.globeMaterial();
      globeMaterial.shininess = 120;
    }
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          
          globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
          specularImageUrl="https://unpkg.com/three-globe/example/img/earth-water.png"
          
          backgroundColor="rgba(0,0,0,0)"

          atmosphereColor="#93c5fd"
          atmosphereAltitude={0.18}
          
          pointsData={satellites}
          pointLat="lat"
          pointLng="lng"
          pointAltitude={() => Math.random() * 0.4 + 0.15}
          
          pointColor={(d) => ['INSAT-3DS', 'CHANDRAYAAN-3'].includes(d.name) ? '#ef4444' : '#0ea5e9'}
          pointRadius={(d) => ['INSAT-3DS', 'CHANDRAYAAN-3'].includes(d.name) ? 0.12 : 0.02}
          pointResolution={32}
        />
      )}
    </div>
  );
}