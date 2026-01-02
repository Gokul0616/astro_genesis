import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../lib/store';
import { Button } from '../ui/button';
import { Rocket } from 'lucide-react';

export default function IntroScreen() {
  const setStage = useGameStore((state) => state.setStage);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl"
      >
        <h1 className="text-6xl md:text-8xl font-heading font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-secondary text-shadow-neon">
          ASTRO GENESIS
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light mb-12 max-w-2xl mx-auto leading-relaxed">
          The Earth is fading. Humanity's last hope lies in the stars. 
          Select a new home, survive the journey, and build the future of civilization.
        </p>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            size="lg" 
            onClick={() => setStage('planet-selection')}
            className="text-xl px-12 py-8 bg-primary hover:bg-primary/80 text-primary-foreground font-bold tracking-widest rounded-none border border-primary/50 shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          >
            <Rocket className="mr-3 h-6 w-6" />
            INITIATE LAUNCH SEQUENCE
          </Button>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-10 left-0 right-0 text-center opacity-50 text-sm font-mono">
        SYSTEM STATUS: ONLINE // WAITING FOR PILOT INPUT
      </div>
    </div>
  );
}
