export interface CarUpgrades {
  boosterRockets: boolean;
}

export const DEFAULT_UPGRADES: CarUpgrades = {
  boosterRockets: false,
};

// Boost config
export const BOOST_DURATION = 120; // frames (~2 seconds at 60fps)
export const BOOST_COOLDOWN = 600; // frames (~10 seconds)
export const BOOST_MULTIPLIER = 2.5;
