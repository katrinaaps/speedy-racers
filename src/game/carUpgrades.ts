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
  bodyStyle: BodyStyle;
  paintColor: PaintColor;
}

export const DEFAULT_UPGRADES: CarUpgrades = {
  boosterRockets: false,
  bigWheels: false,
  wings: false,
  parachute: false,
  bodyStyle: "sedan",
  paintColor: "#3b82f6",
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
