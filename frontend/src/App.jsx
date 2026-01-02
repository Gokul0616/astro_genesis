import React from 'react';
import { useGameStore } from './lib/store';
import IntroScreen from './components/game/IntroScreen';
import PlanetSelector from './components/game/PlanetSelector';
import TravelMinigame from './components/game/TravelMinigame';
import CivilizationBuilder from './components/game/CivilizationBuilder';
import { Toaster } from './components/ui/sonner';
import { AnimatePresence, motion } from 'framer-motion';

export default function App() {
  const currentStage = useGameStore((state) => state.currentStage);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground font-body select-none">
      {/* Background Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40"
        style={{ 
          backgroundImage: `url('https://static.prod-images.emergentagent.com/jobs/56303e92-a55e-4365-b7ca-7ced0e33a6a7/images/98bad85ea7e4a2847571b935a503b9aaf0cff726f285cea413290f7221509354.png')`
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-dark opacity-80" />
      
      {/* Content Layer */}
      <div className="relative z-10 w-full h-full">
        <AnimatePresence mode="wait">
          {currentStage === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="w-full h-full"
            >
              <IntroScreen />
            </motion.div>
          )}
          
          {currentStage === 'planet-selection' && (
            <motion.div 
              key="select"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="w-full h-full"
            >
              <PlanetSelector />
            </motion.div>
          )}
          
          {currentStage === 'travel' && (
            <motion.div 
              key="travel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              <TravelMinigame />
            </motion.div>
          )}
          
          {currentStage === 'civilization' && (
            <motion.div 
              key="civ"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              <CivilizationBuilder />
            </motion.div>
          )}

          {currentStage === 'game-over' && (
             <motion.div 
             key="gameover"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="flex flex-col items-center justify-center h-screen bg-black/90"
           >
             <h1 className="text-6xl font-heading text-destructive mb-4">MISSION FAILED</h1>
             <p className="text-xl mb-8">Your ship was destroyed in the asteroid field.</p>
             <button 
               onClick={() => useGameStore.getState().resetGame()}
               className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded hover:bg-primary/80 transition-colors"
             >
               RETRY MISSION
             </button>
           </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Toaster theme="dark" position="top-center" />
    </div>
  );
}
