import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';

export default function OrbitalGlobe({ satellites }) {
  const globeRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Automatically measure the container to prevent the canvas from collapsing to 0x0
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    
    // Slight delay ensures the parent div has fully rendered before measuring
    setTimeout(updateDimensions, 100);
    window.addEventListener('resize', updateDimensions);
    
    // Spin the camera to focus directly on India (ASTRA 2026 Context)
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: 20.59, lng: 78.96, altitude: 2.2 }, 1000);
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
          // High-fidelity dark mode Earth textures
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundColor="#000000"
          
          // Render the 450+ satellites as glowing nodes
          pointsData={satellites}
          pointLat="lat"
          pointLng="lng"
          pointAltitude={() => Math.random() * 0.4 + 0.1} // Staggered orbital heights
          
          // Make the critical targets flash red, while the LEO swarm stays cyan
          pointColor={(d) => ['INSAT-3DS', 'CHANDRAYAAN-3 ORBITER'].includes(d.name) ? '#ef4444' : '#0ea5e9'}
          pointRadius={(d) => ['INSAT-3DS', 'CHANDRAYAAN-3 ORBITER'].includes(d.name) ? 0.15 : 0.02}
          pointResolution={16}
        />
      )}
    </div>
  );
}