import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../lib/store';
import { Button } from '../ui/button';
import { Shield, AlertTriangle } from 'lucide-react';

export default function TravelMinigame() {
  const { setStage, updateTravelProgress, updateShipHealth, shipHealth, travelProgress, selectedPlanet } = useGameStore();
  const canvasRef = useRef(null);
  const [gameActive, setGameActive] = useState(true);
  
  // Game Configuration
  const SHIP_SIZE = 40;
  const GAME_DURATION = 2000; // Frames (approx 30-40 seconds at 60fps)
  
  // Refs for loop state to avoid closure staleness
  const gameStateRef = useRef({
    playerX: 50, // Percent
    asteroids: [],
    progress: 0,
    health: 100,
    keys: { ArrowLeft: false, ArrowRight: false }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', resize);
    resize();

    const handleKeyDown = (e) => {
      if (gameStateRef.current.keys.hasOwnProperty(e.code)) {
        gameStateRef.current.keys[e.code] = true;
      }
    };
    const handleKeyUp = (e) => {
      if (gameStateRef.current.keys.hasOwnProperty(e.code)) {
        gameStateRef.current.keys[e.code] = false;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Game Loop
    const render = () => {
      if (!gameActive) return;

      // Update State
      const state = gameStateRef.current;
      
      // Move Player
      if (state.keys.ArrowLeft) state.playerX = Math.max(5, state.playerX - 1.5);
      if (state.keys.ArrowRight) state.playerX = Math.min(95, state.playerX + 1.5);
      
      // Spawn Asteroids
      if (Math.random() < 0.05) { // Spawn rate
        state.asteroids.push({
          x: Math.random() * 100,
          y: -10,
          size: Math.random() * 30 + 10,
          speed: Math.random() * 0.5 + 0.2
        });
      }

      // Update Asteroids
      state.asteroids.forEach(asteroid => {
        asteroid.y += asteroid.speed;
      });

      // Collision Detection & Cleanup
      const playerRect = {
        x: (state.playerX / 100) * width - SHIP_SIZE/2,
        y: height - 100,
        width: SHIP_SIZE,
        height: SHIP_SIZE
      };

      state.asteroids = state.asteroids.filter(asteroid => {
        // Hit logic
        const astX = (asteroid.x / 100) * width;
        const astY = (asteroid.y / 100) * height;
        const dist = Math.hypot(astX - (playerRect.x + SHIP_SIZE/2), astY - (playerRect.y + SHIP_SIZE/2));
        
        if (dist < (asteroid.size + SHIP_SIZE/2)) {
          state.health -= 10;
          updateShipHealth(state.health);
          return false; // Remove asteroid
        }
        return asteroid.y < 110; // Remove if off screen
      });

      // Progress
      state.progress += 100 / GAME_DURATION;
      updateTravelProgress(Math.min(100, state.progress));

      if (state.progress >= 100) {
        setGameActive(false);
        setStage('civilization');
      }

      if (state.health <= 0) {
        setGameActive(false);
        // Game Over logic handled by store listener
      }

      // Draw
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, width, height);

      // Starfield effect (simple)
      ctx.fillStyle = '#FFF';
      for(let i=0; i<50; i++) {
        ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
      }

      // Draw Player
      ctx.fillStyle = '#00f0ff';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#00f0ff';
      ctx.beginPath();
      ctx.moveTo(playerRect.x + SHIP_SIZE/2, playerRect.y);
      ctx.lineTo(playerRect.x + SHIP_SIZE, playerRect.y + SHIP_SIZE);
      ctx.lineTo(playerRect.x, playerRect.y + SHIP_SIZE);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Asteroids
      ctx.fillStyle = '#888';
      state.asteroids.forEach(ast => {
        const x = (ast.x / 100) * width;
        const y = (ast.y / 100) * height;
        ctx.beginPath();
        ctx.arc(x, y, ast.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameActive, setStage, updateShipHealth, updateTravelProgress]);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {/* HUD Overlay */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start">
        <div className="flex flex-col gap-2 w-64">
          <div className="flex justify-between text-primary font-heading font-bold">
            <span>HYPERDRIVE CHARGE</span>
            <span>{Math.round(travelProgress)}%</span>
          </div>
          <div className="h-4 bg-black/50 border border-primary/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary shadow-[0_0_10px_rgba(0,240,255,0.5)] transition-all duration-75"
              style={{ width: `${travelProgress}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 w-64 items-end">
           <div className="flex items-center text-destructive font-heading font-bold">
            <Shield className="w-5 h-5 mr-2" />
            <span>SHIELD INTEGRITY</span>
          </div>
          <div className="w-full h-4 bg-black/50 border border-destructive/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-destructive shadow-[0_0_10px_rgba(255,0,0,0.5)] transition-all duration-300"
              style={{ width: `${shipHealth}%` }}
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        <div className="bg-black/60 backdrop-blur border border-white/10 px-6 py-2 rounded-full text-muted-foreground text-sm">
          USE <span className="text-white font-bold mx-1">LEFT / RIGHT ARROWS</span> TO DODGE ASTEROIDS
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
         {/* Warning Indicators could go here */}
      </div>
    </div>
  );
}
