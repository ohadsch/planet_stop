// Cliff edge position
const CLIFF_X = 820;

// All 10 terrains with unique physics and elevation profiles
export const TERRAINS = [
  {
    id: 'LUNAR_TARMAC',
    name: 'Lunar Tarmac',
    description: 'Standard surface - balanced grip.',
    accel: 180,
    rollingResistance: 15,
    brakeDecel: 340,
    initialSpeed: 50,
    backgroundColor: '#0a0a1a',
    groundColor: 0x2a2a3a,
    elevationProfile: [
      { x: 0, y: 0 },
      { x: 200, y: 0 },
      { x: 400, y: -15 },
      { x: 600, y: -15 },
      { x: CLIFF_X, y: 0 }
    ],
    slopeZones: []
  },

  {
    id: 'ICE_SHELF',
    name: 'Ice Shelf',
    description: 'Low friction - braking is weak!',
    accel: 160,
    rollingResistance: 5,
    brakeDecel: 180,  // Very weak brakes
    initialSpeed: 60,
    backgroundColor: '#0a1520',
    groundColor: 0x3a4a5a,
    elevationProfile: [
      { x: 0, y: 0 },
      { x: 300, y: 0 },
      { x: 500, y: 10 },
      { x: 700, y: 10 },
      { x: CLIFF_X, y: 15 }
    ],
    slopeZones: [
      { fromX: 400, toX: CLIFF_X, accelMult: 1.1, brakeMult: 0.7, resistAdd: -3 }
    ]
  },

  {
    id: 'RED_SAND',
    name: 'Red Sand Drift',
    description: 'Heavy resistance slows you down.',
    accel: 200,
    rollingResistance: 40,  // High resistance
    brakeDecel: 380,
    initialSpeed: 45,
    backgroundColor: '#1a0a0a',
    groundColor: 0x4a2a2a,
    elevationProfile: [
      { x: 0, y: 0 },
      { x: 150, y: -10 },
      { x: 300, y: 0 },
      { x: 500, y: -20 },
      { x: 650, y: -10 },
      { x: CLIFF_X, y: 0 }
    ],
    slopeZones: [
      { fromX: 250, toX: 400, accelMult: 0.8, brakeMult: 1.1, resistAdd: 15 }
    ]
  },

  {
    id: 'CRATER_DUST',
    name: 'Crater Dust Flats',
    description: 'Dust patches reduce braking grip.',
    accel: 190,
    rollingResistance: 12,
    brakeDecel: 320,
    initialSpeed: 55,
    backgroundColor: '#0f0f18',
    groundColor: 0x35353f,
    elevationProfile: [
      { x: 0, y: 0 },
      { x: 200, y: 0 },
      { x: 350, y: -25 },
      { x: 450, y: -25 },
      { x: 550, y: 0 },
      { x: 700, y: 0 },
      { x: CLIFF_X, y: 10 }
    ],
    slopeZones: [
      { fromX: 300, toX: 500, accelMult: 1.0, brakeMult: 0.6, resistAdd: 5 },  // Dust zone - bad brakes
      { fromX: 650, toX: CLIFF_X, accelMult: 1.15, brakeMult: 0.75, resistAdd: -5 }
    ]
  },

  {
    id: 'MAGNETIC_RIDGE',
    name: 'Magnetic Ridge',
    description: 'Strange forces accelerate mid-track.',
    accel: 170,
    rollingResistance: 18,
    brakeDecel: 300,
    initialSpeed: 40,
    backgroundColor: '#0a0a20',
    groundColor: 0x2a2a4a,
    elevationProfile: [
      { x: 0, y: 0 },
      { x: 150, y: -20 },
      { x: 300, y: -50 },  // High ridge
      { x: 450, y: -50 },
      { x: 600, y: -20 },
      { x: 750, y: 0 },
      { x: CLIFF_X, y: 10 }
    ],
    slopeZones: [
      { fromX: 200, toX: 350, accelMult: 1.5, brakeMult: 0.9, resistAdd: -10 },  // Magnetic boost up
      { fromX: 500, toX: 700, accelMult: 1.4, brakeMult: 0.8, resistAdd: -8 }   // Boost down
    ]
  },

  {
    id: 'BASALT_SLOPE',
    name: 'Basalt Slope',
    description: 'Steep downhill near the edge!',
    accel: 175,
    rollingResistance: 20,
    brakeDecel: 350,
    initialSpeed: 45,
    backgroundColor: '#0a0808',
    groundColor: 0x252020,
    elevationProfile: [
      { x: 0, y: -40 },
      { x: 200, y: -40 },
      { x: 350, y: -30 },
      { x: 500, y: -20 },
      { x: 600, y: 0 },
      { x: 700, y: 30 },   // Steep drop
      { x: CLIFF_X, y: 50 }
    ],
    slopeZones: [
      { fromX: 550, toX: CLIFF_X, accelMult: 1.5, brakeMult: 0.5, resistAdd: -15 }  // Dangerous downhill
    ]
  },

  {
    id: 'UPDRAFT_PLATEAU',
    name: 'Updraft Plateau',
    description: 'Uphill climb slows you mid-track.',
    accel: 200,
    rollingResistance: 15,
    brakeDecel: 380,
    initialSpeed: 60,
    backgroundColor: '#0f0a15',
    groundColor: 0x302838,
    elevationProfile: [
      { x: 0, y: 20 },
      { x: 150, y: 20 },
      { x: 300, y: -30 },  // Uphill
      { x: 500, y: -50 },  // Plateau top
      { x: 650, y: -50 },
      { x: 750, y: -30 },
      { x: CLIFF_X, y: -20 }
    ],
    slopeZones: [
      { fromX: 150, toX: 350, accelMult: 0.5, brakeMult: 1.4, resistAdd: 30 },  // Hard uphill
      { fromX: 700, toX: CLIFF_X, accelMult: 1.2, brakeMult: 0.9, resistAdd: -5 }
    ]
  },

  {
    id: 'METEOR_GRAVEL',
    name: 'Meteor Gravel',
    description: 'Bumpy patches disrupt your speed.',
    accel: 185,
    rollingResistance: 22,
    brakeDecel: 300,
    initialSpeed: 50,
    backgroundColor: '#0c0c0c',
    groundColor: 0x2f2f2f,
    elevationProfile: [
      { x: 0, y: 0 },
      { x: 100, y: -8 },
      { x: 180, y: 5 },
      { x: 260, y: -12 },
      { x: 340, y: 8 },
      { x: 420, y: -5 },
      { x: 500, y: 10 },
      { x: 580, y: -8 },
      { x: 660, y: 5 },
      { x: 740, y: -3 },
      { x: CLIFF_X, y: 8 }
    ],
    slopeZones: [
      { fromX: 150, toX: 280, accelMult: 0.9, brakeMult: 0.85, resistAdd: 25 },
      { fromX: 380, toX: 520, accelMult: 1.1, brakeMult: 0.8, resistAdd: 20 },
      { fromX: 620, toX: 760, accelMult: 0.95, brakeMult: 0.9, resistAdd: 18 }
    ]
  },

  {
    id: 'THIN_ATMOSPHERE',
    name: 'Thin Atmosphere',
    description: 'Low drag - you carry speed far.',
    accel: 150,
    rollingResistance: 3,  // Almost no resistance
    brakeDecel: 280,
    initialSpeed: 70,  // Fast start
    backgroundColor: '#02020a',
    groundColor: 0x1a1a2a,
    elevationProfile: [
      { x: 0, y: 0 },
      { x: 250, y: -5 },
      { x: 500, y: 0 },
      { x: 700, y: 5 },
      { x: CLIFF_X, y: 10 }
    ],
    slopeZones: [
      { fromX: 600, toX: CLIFF_X, accelMult: 1.1, brakeMult: 0.85, resistAdd: -2 }
    ]
  },

  {
    id: 'CHAOS_CANYON',
    name: 'Chaos Canyon',
    description: 'The ultimate challenge - survive the chaos!',
    accel: 195,
    rollingResistance: 18,
    brakeDecel: 320,
    initialSpeed: 55,
    backgroundColor: '#0a0510',
    groundColor: 0x2a2030,
    elevationProfile: [
      { x: 0, y: 10 },
      { x: 100, y: 0 },
      { x: 200, y: -35 },  // Uphill
      { x: 300, y: -45 },
      { x: 400, y: -30 },  // Down a bit
      { x: 500, y: -50 },  // Back up
      { x: 600, y: -20 },  // Down
      { x: 700, y: 20 },   // Steep down
      { x: CLIFF_X, y: 40 }
    ],
    slopeZones: [
      { fromX: 100, toX: 250, accelMult: 0.6, brakeMult: 1.3, resistAdd: 25 },   // Hard uphill
      { fromX: 350, toX: 450, accelMult: 1.3, brakeMult: 0.7, resistAdd: -8 },   // Downhill
      { fromX: 450, toX: 550, accelMult: 0.7, brakeMult: 1.2, resistAdd: 20 },   // Uphill again
      { fromX: 600, toX: CLIFF_X, accelMult: 1.6, brakeMult: 0.4, resistAdd: -12 } // Deadly final slope
    ]
  }
];

export default TERRAINS;
