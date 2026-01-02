import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../lib/store';
import { Button } from '../ui/button';
import { Zap, Box, Users, Home, Sun, Pickaxe } from 'lucide-react';
import { toast } from 'sonner';

const BUILDING_TYPES = {
  HABITAT: {
    id: 'habitat',
    name: 'Living Pod',
    icon: Home,
    cost: { energy: 20, minerals: 50 },
    production: { population: 2 },
    desc: 'Increases max population.'
  },
  SOLAR: {
    id: 'solar',
    name: 'Solar Array',
    icon: Sun,
    cost: { minerals: 30 },
    production: { energy: 5 },
    desc: 'Generates passive energy.'
  },
  MINE: {
    id: 'mine',
    name: 'Auto-Miner',
    icon: Pickaxe,
    cost: { energy: 30, population: 2 },
    production: { minerals: 3 },
    desc: 'Extracts minerals from the ground.'
  }
};

export default function CivilizationBuilder() {
  const { resources, addResource, removeResource, buildings, addBuilding, selectedPlanet } = useGameStore();
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      let energyGain = 0;
      let mineralGain = 0;
      let popGain = 0;

      buildings.forEach(b => {
        const type = Object.values(BUILDING_TYPES).find(t => t.id === b.type);
        if (type.production.energy) energyGain += type.production.energy;
        if (type.production.minerals) mineralGain += type.production.minerals;
        if (type.production.population) popGain += type.production.population; // Usually capacity, but simplified here
      });

      // Passive drain
      addResource('energy', energyGain - 1); 
      addResource('minerals', mineralGain);
      
    }, 2000);
    return () => clearInterval(interval);
  }, [buildings, addResource]);

  const handleBuild = (typeKey) => {
    const type = BUILDING_TYPES[typeKey];
    
    // Check Costs
    if (resources.energy < (type.cost.energy || 0) || 
        resources.minerals < (type.cost.minerals || 0) ||
        resources.population < (type.cost.population || 0)) {
      toast.error("Insufficient Resources!");
      return;
    }

    // Deduct
    if (type.cost.energy) removeResource('energy', type.cost.energy);
    if (type.cost.minerals) removeResource('minerals', type.cost.minerals);
    if (type.cost.population) removeResource('population', type.cost.population);

    addBuilding({
      id: Date.now(),
      type: type.id,
      index: selectedSlot
    });
    
    setSelectedSlot(null);
    toast.success(`${type.name} Constructed!`);
  };

  const GridSlot = ({ index }) => {
    const building = buildings.find(b => b.index === index);
    const BuildingIcon = building ? Object.values(BUILDING_TYPES).find(t => t.id === building.type).icon : null;

    return (
      <div 
        onClick={() => !building && setSelectedSlot(index)}
        className={`
          aspect-square border border-white/10 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200
          ${building ? 'bg-primary/20 border-primary/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'hover:bg-white/5 hover:border-white/30'}
          ${selectedSlot === index ? 'ring-2 ring-accent bg-accent/10' : ''}
        `}
      >
        {building ? (
          <BuildingIcon className="w-8 h-8 text-primary" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-white/10" />
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full bg-black/80">
      {/* Sidebar - Resources */}
      <div className="w-80 bg-card border-r border-border p-6 flex flex-col gap-6 z-20">
        <h2 className="text-2xl font-heading text-primary">{selectedPlanet?.name || 'Unknown'} Colony</h2>
        
        <div className="space-y-4">
          <div className="bg-black/40 p-4 rounded border border-white/5 flex items-center justify-between">
            <div className="flex items-center text-yellow-400">
              <Zap className="w-5 h-5 mr-3" />
              <span>Energy</span>
            </div>
            <span className="font-mono text-xl">{resources.energy}</span>
          </div>
          
          <div className="bg-black/40 p-4 rounded border border-white/5 flex items-center justify-between">
            <div className="flex items-center text-blue-400">
              <Box className="w-5 h-5 mr-3" />
              <span>Minerals</span>
            </div>
            <span className="font-mono text-xl">{resources.minerals}</span>
          </div>
          
          <div className="bg-black/40 p-4 rounded border border-white/5 flex items-center justify-between">
            <div className="flex items-center text-green-400">
              <Users className="w-5 h-5 mr-3" />
              <span>Colonists</span>
            </div>
            <span className="font-mono text-xl">{resources.population}</span>
          </div>
        </div>

        {selectedSlot !== null && (
          <div className="mt-auto animate-in slide-in-from-left fade-in duration-300">
            <h3 className="text-sm uppercase text-muted-foreground mb-4 font-bold tracking-wider">Construction Menu</h3>
            <div className="space-y-3">
              {Object.keys(BUILDING_TYPES).map((key) => {
                const type = BUILDING_TYPES[key];
                return (
                  <button
                    key={key}
                    onClick={() => handleBuild(key)}
                    className="w-full text-left p-3 rounded bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/50 transition-all group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold group-hover:text-primary">{type.name}</span>
                      <type.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">{type.desc}</div>
                    <div className="flex gap-2 text-xs font-mono">
                      {type.cost.energy && <span className="text-yellow-500">{type.cost.energy} NRG</span>}
                      {type.cost.minerals && <span className="text-blue-500">{type.cost.minerals} MIN</span>}
                      {type.cost.population && <span className="text-green-500">{type.cost.population} POP</span>}
                    </div>
                  </button>
                )
              })}
            </div>
            <Button variant="ghost" className="w-full mt-2" onClick={() => setSelectedSlot(null)}>Cancel Selection</Button>
          </div>
        )}
      </div>

      {/* Main View - Planet Surface */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-12">
        <div 
          className="absolute inset-0 z-0 opacity-20 bg-cover bg-center mix-blend-overlay"
          style={{ backgroundImage: `url(${selectedPlanet?.image})` }}
        />
        
        {/* Isometric Grid Container */}
        <div className="relative z-10 w-full max-w-4xl aspect-[4/3] bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-8 shadow-2xl">
          <div className="grid grid-cols-6 grid-rows-4 gap-4 w-full h-full">
            {Array.from({ length: 24 }).map((_, i) => (
              <GridSlot key={i} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
