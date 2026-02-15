export type BodyStyle = "sedan" | "sport" | "truck" | "formula";
export type PaintColor = string;

export const BODY_STYLES: { key: BodyStyle; label: string; description: string }[] = [
  { key: "sedan", label: "Sedan", description: "Balanced all-rounder" },
  { key: "sport", label: "Sport", description: "Low & sleek, built for speed" },
  { key: "truck", label: "Truck", description: "Big & beefy, high profile" },
  { key: "formula", label: "Formula", description: "Open-wheel racer" },
];

export const PAINT_COLORS: { color: string; label: string }[] = [
  { color: "#3b82f6", label: "Blue" },
  { color: "#ef4444", label: "Red" },
  { color: "#22c55e", label: "Green" },
  { color: "#eab308", label: "Yellow" },
  { color: "#a855f7", label: "Purple" },
  { color: "#f97316", label: "Orange" },
  { color: "#06b6d4", label: "Cyan" },
  { color: "#ec4899", label: "Pink" },
  { color: "#ffffff", label: "White" },
  { color: "#1a1a1a", label: "Black" },
];

export interface CarUpgrades {
  boosterRockets: boolean;
  bigWheels: boolean;
  wings: boolean;
  parachute: boolean;
  laser: boolean;
  upgradedEngine: boolean;
  bodyStyle: BodyStyle;
  paintColor: PaintColor;
}

export const DEFAULT_UPGRADES: CarUpgrades = {
  boosterRockets: false,
  bigWheels: false,
  wings: false,
  parachute: false,
  laser: false,
  upgradedEngine: false,
  bodyStyle: "sedan",
  paintColor: "#3b82f6",
};

// Boost config
export const BOOST_DURATION = 120;
export const BOOST_COOLDOWN = 600;
export const BOOST_MULTIPLIER = 2.5;

// Wings config
export const WINGS_DURATION = 180;
export const WINGS_COOLDOWN = 480;
export const WINGS_HEIGHT = 6;

// Parachute config
export const PARACHUTE_DURATION = 90;
export const PARACHUTE_COOLDOWN = 360;
export const PARACHUTE_BRAKE_FACTOR = 0.85;

// Big Wheels config
export const BIG_WHEELS_STEER_MULT = 1.8;

// Laser config
export const LASER_COOLDOWN = 300; // frames (~5 seconds)
export const LASER_RANGE = 0.8; // angle range to hit
export const LASER_WHEEL_DAMAGE_DURATION = 360; // frames (~6 seconds) of impaired steering

// Upgraded Engine config
export const ENGINE_SPEED_MULT = 1.35; // 35% faster top speed
