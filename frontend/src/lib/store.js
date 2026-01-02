import { create } from 'zustand';

export const useGameStore = create((set, get) => ({
  // Game Stage: 'intro', 'planet-selection', 'travel', 'civilization', 'game-over'
  currentStage: 'intro',
  
  // Player State
  playerName: 'Explorer',
  selectedPlanet: null, // { id, name, distance, type, image, difficulty }
  
  // Travel State
  travelProgress: 0, // 0 to 100
  shipHealth: 100,
  
  // Civilization State
  resources: {
    energy: 100,
    minerals: 50,
    population: 10
  },
  buildings: [], // Array of { id, type, x, y, level }
  
  // Actions
  setStage: (stage) => set({ currentStage: stage }),
  selectPlanet: (planet) => set({ selectedPlanet: planet }),
  updateTravelProgress: (progress) => set({ travelProgress: progress }),
  updateShipHealth: (health) => {
    set({ shipHealth: health });
    if (health <= 0) {
      set({ currentStage: 'game-over' });
    }
  },
  addResource: (type, amount) => set((state) => ({
    resources: {
      ...state.resources,
      [type]: state.resources[type] + amount
    }
  })),
  removeResource: (type, amount) => set((state) => ({
    resources: {
      ...state.resources,
      [type]: Math.max(0, state.resources[type] - amount)
    }
  })),
  addBuilding: (building) => set((state) => ({
    buildings: [...state.buildings, building]
  })),
  resetGame: () => set({
    currentStage: 'intro',
    selectedPlanet: null,
    travelProgress: 0,
    shipHealth: 100,
    resources: { energy: 100, minerals: 50, population: 10 },
    buildings: []
  })
}));
