export interface CarUpgrades {
  boosterRockets: boolean;
  bigWheels: boolean;
  wings: boolean;
  parachute: boolean;
}

export const DEFAULT_UPGRADES: CarUpgrades = {
  boosterRockets: false,
  bigWheels: false,
  wings: false,
  parachute: false,
};

// Boost config
export const BOOST_DURATION = 120; // frames (~2 seconds at 60fps)
export const BOOST_COOLDOWN = 600; // frames (~10 seconds)
export const BOOST_MULTIPLIER = 2.5;

// Wings config
export const WINGS_DURATION = 180; // frames (~3 seconds)
export const WINGS_COOLDOWN = 480; // frames (~8 seconds)
export const WINGS_HEIGHT = 6; // how high the car flies

// Parachute config
export const PARACHUTE_DURATION = 90; // frames (~1.5 seconds)
export const PARACHUTE_COOLDOWN = 360; // frames (~6 seconds)
export const PARACHUTE_BRAKE_FACTOR = 0.85; // speed multiplied by (1 - this) each frame

// Big Wheels config
export const BIG_WHEELS_STEER_MULT = 1.8; // steering speed multiplier
