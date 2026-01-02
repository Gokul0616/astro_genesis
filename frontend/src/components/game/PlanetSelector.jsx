import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../lib/store';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Trophy, Skull, Thermometer, Wind } from 'lucide-react';

const PLANETS = [
  {
    id: 'terran',
    name: 'Neo Terra',
    description: 'A lush, Earth-like paradise. Ideal for rapid colonization, but scarce in rare minerals.',
    distance: '4.2 Light Years',
    difficulty: 'Easy',
    image: 'https://static.prod-images.emergentagent.com/jobs/56303e92-a55e-4365-b7ca-7ced0e33a6a7/images/f959d50223cc7f53d76b9f377152a663ded2e6f6d7c1f67263435d2765ae761b.png',
    stats: {
      habitability: 95,
      resources: 40,
      threat: 10
    },
    color: 'text-green-400'
  },
  {
    id: 'ice',
    name: 'Cryo Prime',
    description: 'A frozen wasteland rich in ancient isotopes. Survival requires advanced thermal tech.',
    distance: '12 Light Years',
    difficulty: 'Medium',
    image: 'https://static.prod-images.emergentagent.com/jobs/56303e92-a55e-4365-b7ca-7ced0e33a6a7/images/b0d40de198da7cf7cce638e30146ee1f590971cb2cc7985f749e4a0ed35ad823.png',
    stats: {
      habitability: 30,
      resources: 80,
      threat: 50
    },
    color: 'text-cyan-300'
  },
  {
    id: 'volcanic',
    name: 'Ignis IV',
    description: 'A volatile world of magma and ash. Extreme energy potential, but highly dangerous.',
    distance: '25 Light Years',
    difficulty: 'Hard',
    image: 'https://static.prod-images.emergentagent.com/jobs/56303e92-a55e-4365-b7ca-7ced0e33a6a7/images/acec30fcaf4609ba3746bda7f98c39fb166a909d51a1dc59fc2fb0435540be98.png',
    stats: {
      habitability: 10,
      resources: 100,
      threat: 90
    },
    color: 'text-red-500'
  }
];

export default function PlanetSelector() {
  const { selectPlanet, setStage } = useGameStore();
  const [hoveredPlanet, setHoveredPlanet] = React.useState(null);

  const handleSelect = (planet) => {
    selectPlanet(planet);
    setStage('travel');
  };

  return (
    <div className="min-h-screen flex flex-col p-8 pt-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-heading mb-4 text-primary">SELECT DESTINATION</h2>
        <p className="text-muted-foreground">Choose a planet to establish the new colony. Warning: Longer distances increase travel risk.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
        {PLANETS.map((planet, index) => (
          <motion.div
            key={planet.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            onMouseEnter={() => setHoveredPlanet(planet.id)}
            onMouseLeave={() => setHoveredPlanet(null)}
          >
            <Card className={`h-full bg-black/40 border-primary/20 hover:border-primary transition-all duration-300 backdrop-blur-sm overflow-hidden group ${hoveredPlanet === planet.id ? 'shadow-[0_0_30px_rgba(0,240,255,0.2)]' : ''}`}>
              <div className="h-64 overflow-hidden relative p-6 flex items-center justify-center">
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10" />
                 <motion.img 
                  src={planet.image} 
                  alt={planet.name}
                  className="w-48 h-48 object-contain z-0"
                  animate={{ 
                    rotate: 360,
                    scale: hoveredPlanet === planet.id ? 1.1 : 1 
                  }}
                  transition={{ 
                    rotate: { duration: 100, repeat: Infinity, ease: "linear" },
                    scale: { duration: 0.5 }
                  }}
                 />
              </div>
              
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="outline" className={`${planet.color} border-current`}>
                    {planet.distance}
                  </Badge>
                  <Badge className={
                    planet.difficulty === 'Easy' ? 'bg-green-500' :
                    planet.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-600'
                  }>
                    {planet.difficulty}
                  </Badge>
                </div>
                <CardTitle className={`text-3xl font-heading ${planet.color}`}>{planet.name}</CardTitle>
                <CardDescription className="text-lg">{planet.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center text-muted-foreground"><Thermometer className="w-4 h-4 mr-2"/> Habitability</span>
                    <div className="w-24 h-2 bg-secondary/20 rounded-full overflow-hidden">
                      <div className="h-full bg-green-400" style={{ width: `${planet.stats.habitability}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center text-muted-foreground"><Trophy className="w-4 h-4 mr-2"/> Resources</span>
                    <div className="w-24 h-2 bg-secondary/20 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400" style={{ width: `${planet.stats.resources}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center text-muted-foreground"><Skull className="w-4 h-4 mr-2"/> Threat Level</span>
                    <div className="w-24 h-2 bg-secondary/20 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: `${planet.stats.threat}%` }} />
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/50 text-lg py-6 group-hover:bg-primary group-hover:text-black transition-all"
                  onClick={() => handleSelect(planet)}
                >
                  SET COURSE
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
