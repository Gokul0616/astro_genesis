import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Stars, Float, Text, useTexture, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../lib/store';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Shield, Radio, Crosshair, Zap, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 3D ASSETS & COMPONENTS ---

// Procedural Spaceship Mesh
const Spaceship = ({ isInside, hp }) => {
  const group = useRef();
  
  // Shake effect on low health or hit
  useFrame((state) => {
    if (!group.current) return;
    
    // Gentle floating
    group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    
    // Engine vibration
    if (!isInside) {
      group.current.position.y = Math.sin(state.clock.elapsedTime * 10) * 0.005;
    }
  });

  if (isInside) return null; // Don't render ship body if inside (or render a cockpit interior later)

  return (
    <group ref={group}>
      {/* Main Body */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <coneGeometry args={[1, 4, 8]} />
        <meshStandardMaterial color="#222" roughness={0.3} metalness={0.8} />
      </mesh>
      
      {/* Cockpit Glass */}
      <mesh position={[0, 0.5, 0.8]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.8, 0.5, 1.2]} />
        <meshPhysicalMaterial 
          color="#88ccff" 
          transparent 
          opacity={0.6} 
          roughness={0} 
          metalness={0.9} 
          transmission={0.5} 
        />
      </mesh>

      {/* Wings */}
      <mesh position={[1.5, -0.5, 0.5]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[2, 0.1, 1.5]} />
        <meshStandardMaterial color="#444" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[-1.5, -0.5, 0.5]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[2, 0.1, 1.5]} />
        <meshStandardMaterial color="#444" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Engine Glows */}
      <Trail width={2} length={8} color="#00f0ff" attenuation={(t) => t * t}>
        <mesh position={[0.8, -0.8, 1.8]}>
          <sphereGeometry args={[0.2]} />
          <meshBasicMaterial color="#00f0ff" />
        </mesh>
      </Trail>
       <Trail width={2} length={8} color="#00f0ff" attenuation={(t) => t * t}>
        <mesh position={[-0.8, -0.8, 1.8]}>
          <sphereGeometry args={[0.2]} />
          <meshBasicMaterial color="#00f0ff" />
        </mesh>
      </Trail>
    </group>
  );
};

const AsteroidField = ({ count = 200, speed = 0.5 }) => {
  const mesh = useRef();
  const dummy = new THREE.Object3D();
  
  // Initialize random positions
  const asteroids = useRef(new Array(count).fill().map(() => ({
    position: [
      (Math.random() - 0.5) * 100, 
      (Math.random() - 0.5) * 100, 
      -Math.random() * 500 - 50 // Start far ahead
    ],
    rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
    scale: Math.random() * 2 + 0.5
  })));

  useFrame((state, delta) => {
    asteroids.current.forEach((asteroid, i) => {
      // Move towards ship (positive Z)
      asteroid.position[2] += speed + (Math.random() * 0.2);
      
      // Reset if passed
      if (asteroid.position[2] > 10) {
        asteroid.position[2] = -500;
        asteroid.position[0] = (Math.random() - 0.5) * 100;
        asteroid.position[1] = (Math.random() - 0.5) * 100;
      }
      
      // Update dummy for instanced mesh
      dummy.position.set(...asteroid.position);
      dummy.rotation.set(...asteroid.rotation);
      dummy.scale.set(asteroid.scale, asteroid.scale, asteroid.scale);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#554433" roughness={0.8} />
    </instancedMesh>
  );
};

const CockpitOverlay = ({ speed }) => {
  return (
    <group position={[0, 0, -0.5]}>
      {/* HUD Frame */}
      <mesh position={[0, 0, 0]}>
         <planeGeometry args={[16, 9]} />
         <meshBasicMaterial color="black" transparent opacity={0.0} side={THREE.DoubleSide} /> 
         {/* Invisible plane for potential raycasting or just structure */}
      </mesh>
      
      {/* Holographic UI Elements in 3D Space */}
      <Text 
        position={[-3, 2, -2]} 
        fontSize={0.2} 
        color="#00f0ff"
        font="https://fonts.gstatic.com/s/orbitron/v25/yMJRMI8TZgGClJ3gL07O.woff" // Fallback to a standard google font url or use local if available
      >
        SYS: ONLINE
      </Text>
      
       <Text 
        position={[3, 2, -2]} 
        fontSize={0.2} 
        color="#00f0ff"
      >
        V: {Math.round(speed * 1000)} KM/H
      </Text>
    </group>
  );
};

// --- MAIN GAME COMPONENT ---

export default function SpaceFlightSim() {
  const { 
    isInsideView, toggleView, setStage, 
    updateTravelProgress, updateShipHealth, setComms, activeComms,
    travelProgress, shipHealth, selectedPlanet
  } = useGameStore();

  const [speed, setSpeed] = useState(0.5);
  const [lastCommsTime, setLastCommsTime] = useState(0);

  // Narrative Events
  useEffect(() => {
    if (travelProgress > 10 && travelProgress < 12) {
      setComms({ speaker: 'AI NAV', message: 'Leaving orbital gravity well. Engaging hyperdrive.', type: 'info' });
    }
    if (travelProgress > 40 && travelProgress < 42) {
      setComms({ speaker: 'WARN', message: 'Asteroid field detected. Manual piloting required.', type: 'alert' });
    }
    if (travelProgress > 80 && travelProgress < 82) {
      setComms({ speaker: 'AI NAV', message: `Approaching ${selectedPlanet?.name}. Deceleration sequence initiated.`, type: 'info' });
    }
    if (travelProgress >= 100) {
      setStage('civilization');
    }
  }, [travelProgress, setComms, selectedPlanet, setStage]);

  // Clear comms after 5 seconds
  useEffect(() => {
    if (activeComms) {
      const timer = setTimeout(() => setComms(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [activeComms, setComms]);

  return (
    <div className="relative w-full h-full bg-black">
      {/* 3D Canvas */}
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={isInsideView ? [0, 0, 0.5] : [0, 3, 10]} fov={isInsideView ? 90 : 60} />
        
        {/* Environment */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <fog attach="fog" args={['#050510', 5, 50]} />

        {/* Game Objects */}
        <GameLogic 
          isInside={isInsideView} 
          updateProgress={updateTravelProgress}
          currentProgress={travelProgress}
          updateHealth={updateShipHealth}
          currentHealth={shipHealth}
          speed={speed}
        />
        
        <Spaceship isInside={isInsideView} hp={shipHealth} />
        <AsteroidField count={150} speed={speed} />
        
        {/* Cockpit HUD in 3D */}
        {isInsideView && <CockpitOverlay speed={speed} />}
      </Canvas>

      {/* 2D HUD OVERLAY (React UI) */}
      <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
        
        {/* Top Bar: Stats */}
        <div className="flex justify-between items-start pointer-events-auto">
          {/* Health & Status */}
          <div className="bg-black/60 backdrop-blur border border-white/10 p-4 rounded-br-2xl skew-x-[-10deg] ml-[-20px] pl-10">
             <div className="skew-x-[10deg] space-y-2">
               <div className="flex items-center text-destructive font-heading font-bold text-xl">
                 <Shield className="w-6 h-6 mr-2 animate-pulse" />
                 SHIELD: {shipHealth}%
               </div>
               <div className="w-48 h-2 bg-gray-800 rounded-full">
                 <div className="h-full bg-destructive transition-all duration-300" style={{ width: `${shipHealth}%` }} />
               </div>
             </div>
          </div>

          {/* Progress & Target */}
          <div className="bg-black/60 backdrop-blur border border-white/10 p-4 rounded-bl-2xl skew-x-[10deg] mr-[-20px] pr-10 text-right">
             <div className="skew-x-[-10deg] space-y-2">
               <div className="text-primary font-heading font-bold text-xl">
                 DEST: {selectedPlanet?.name?.toUpperCase()}
               </div>
               <div className="text-muted-foreground font-mono">
                 DIST: {Math.max(0, 100 - travelProgress).toFixed(1)} LY
               </div>
             </div>
          </div>
        </div>

        {/* Center: Reticle (Only in first person or general) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50">
           <Crosshair className="w-12 h-12 text-primary" strokeWidth={1} />
        </div>

        {/* Narrative Comms Overlay */}
        <AnimatePresence>
          {activeComms && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-32 left-1/2 -translate-x-1/2 max-w-2xl w-full"
            >
              <div className={`
                backdrop-blur-md border-l-4 p-6 rounded-r-lg shadow-[0_0_30px_rgba(0,0,0,0.5)]
                ${activeComms.type === 'alert' ? 'bg-red-900/40 border-red-500' : 'bg-blue-900/40 border-primary'}
              `}>
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${activeComms.type === 'alert' ? 'bg-red-500/20' : 'bg-primary/20'}`}>
                    <Radio className={`w-6 h-6 ${activeComms.type === 'alert' ? 'text-red-500' : 'text-primary'}`} />
                  </div>
                  <div>
                    <h4 className={`font-bold font-mono text-sm mb-1 ${activeComms.type === 'alert' ? 'text-red-400' : 'text-primary'}`}>
                      {activeComms.speaker} /// TRANSMISSION
                    </h4>
                    <p className="text-lg font-body leading-relaxed text-white text-shadow-neon">
                      "{activeComms.message}"
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Bar: Controls */}
        <div className="flex justify-between items-end pointer-events-auto">
          {/* Speed Control */}
          <div className="flex items-center gap-4 bg-black/60 backdrop-blur p-4 rounded-tr-xl border-t border-r border-white/10">
             <div className="flex flex-col gap-1 items-center">
                <div className="h-24 w-4 bg-gray-800 rounded-full relative overflow-hidden">
                   <div className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-200" style={{ height: `${speed * 100}%` }} />
                </div>
                <span className="text-xs font-mono text-muted-foreground">THRUST</span>
             </div>
             <div className="text-left text-sm text-muted-foreground">
                <p>W / UP : ACCEL</p>
                <p>S / DWN : BRAKE</p>
             </div>
          </div>

          {/* View Toggle */}
          <div className="bg-black/60 backdrop-blur p-4 rounded-tl-xl border-t border-l border-white/10 flex items-center gap-3">
             <span className={`text-sm font-bold ${!isInsideView ? 'text-primary' : 'text-muted-foreground'}`}>EXT</span>
             <Switch 
               checked={isInsideView} 
               onCheckedChange={toggleView}
               className="data-[state=checked]:bg-primary"
             />
             <span className={`text-sm font-bold ${isInsideView ? 'text-primary' : 'text-muted-foreground'}`}>INT</span>
             <Monitor className="w-5 h-5 ml-2 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Logic Component inside Canvas
function GameLogic({ isInside, updateProgress, currentProgress, updateHealth, currentHealth, speed }) {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    // 1. Progress Logic
    if (currentProgress < 100) {
      updateProgress(currentProgress + (delta * 2 * speed)); // Speed affects progress
    }

    // 2. Camera Movement (Flight feel)
    // Lerp camera rotation based on mouse position for looking around
    const targetRotX = mouse.current.y * 0.5;
    const targetRotY = mouse.current.x * -0.5;
    
    // In cockpit, we rotate the camera slightly. In 3rd person, we rotate around the ship (or ship rotates)
    // For simplicity, we just bank the camera slightly
    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, targetRotX, 0.1);
    camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, targetRotY, 0.1);

    // Camera shake on high speed
    if (speed > 0.8) {
       camera.position.x += (Math.random() - 0.5) * 0.05;
       camera.position.y += (Math.random() - 0.5) * 0.05;
    } else {
       // Reset position logic would be complex here due to toggle, relying on PerspectiveCamera default prop reset on render mainly
    }

    // 3. Collision Logic (Simplified for 3D)
    // In a real game we'd raycast. Here we randomly "hit" based on probability if mouse is in "danger zones"
    // Or we just let the simulation ride for the prototype visual. 
    // Let's add a random "collision" event if speed is high to simulate difficulty
    if (speed > 0.9 && Math.random() < 0.005) {
       updateHealth(currentHealth - 5);
       // Camera heavy shake
       camera.position.x += 0.5;
    }
  });

  return null;
}
