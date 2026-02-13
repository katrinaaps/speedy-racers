import { useCallback, useRef, useState } from "react";

export interface CarState {
  angle: number;
  speed: number;
  lane: number;
  laps: number;
  lastCrossed: boolean;
  color: string;
  name: string;
  // Rockets
  boostActive: boolean;
  boostTimer: number;
  boostCooldown: number;
  hasRockets: boolean;
  // Big Wheels
  hasBigWheels: boolean;
  // Wings
  hasWings: boolean;
  wingsActive: boolean;
  wingsTimer: number;
  wingsCooldown: number;
  flyHeight: number;
  // Parachute
  hasParachute: boolean;
  parachuteActive: boolean;
  parachuteTimer: number;
  parachuteCooldown: number;
}

const TOTAL_LAPS = 200;

function makeCarState(overrides: Partial<CarState>): CarState {
  return {
    angle: 0, speed: 0, lane: 1, laps: 0, lastCrossed: false,
    color: "#3b82f6", name: "You",
    boostActive: false, boostTimer: 0, boostCooldown: 0, hasRockets: false,
    hasBigWheels: false,
    hasWings: false, wingsActive: false, wingsTimer: 0, wingsCooldown: 0, flyHeight: 0,
    hasParachute: false, parachuteActive: false, parachuteTimer: 0, parachuteCooldown: 0,
    ...overrides,
  };
}

export function useGameState() {
  const [phase, setPhase] = useState<"countdown" | "racing" | "finished">("countdown");
  const [countdown, setCountdown] = useState(3);
  const [winner, setWinner] = useState<string | null>(null);

  const playerRef = useRef<CarState>(makeCarState({ lane: 1, color: "#3b82f6", name: "You" }));
  const ai1Ref = useRef<CarState>(makeCarState({ lane: 0, color: "#eab308", name: "Yellow" }));
  const ai2Ref = useRef<CarState>(makeCarState({ lane: 2, color: "#ef4444", name: "Red" }));

  const reset = useCallback((keepUpgrades?: boolean) => {
    const prev = playerRef.current;
    playerRef.current = makeCarState({
      lane: 1, color: "#3b82f6", name: "You",
      hasRockets: keepUpgrades ? prev.hasRockets : false,
      hasBigWheels: keepUpgrades ? prev.hasBigWheels : false,
      hasWings: keepUpgrades ? prev.hasWings : false,
      hasParachute: keepUpgrades ? prev.hasParachute : false,
    });
    ai1Ref.current = makeCarState({ lane: 0, color: "#eab308", name: "Yellow" });
    ai2Ref.current = makeCarState({ lane: 2, color: "#ef4444", name: "Red" });
    setWinner(null);
    setPhase("countdown");
    setCountdown(3);
  }, []);

  return {
    phase, setPhase, countdown, setCountdown,
    winner, setWinner,
    playerRef, ai1Ref, ai2Ref,
    reset, TOTAL_LAPS,
  };
}

// Oval track helpers
export const TRACK_A = 50;
export const TRACK_B = 30;
export const LANE_WIDTH = 4;

export function getTrackPosition(angle: number, lane: number, flyHeight = 0): [number, number, number] {
  const offset = (lane - 1) * LANE_WIDTH;
  const a = TRACK_A + offset;
  const b = TRACK_B + offset;
  return [Math.cos(angle) * a, 0.5 + flyHeight, Math.sin(angle) * b];
}

export function getTrackTangent(angle: number, lane: number): number {
  const offset = (lane - 1) * LANE_WIDTH;
  const a = TRACK_A + offset;
  const b = TRACK_B + offset;
  const dx = -Math.sin(angle) * a;
  const dz = Math.cos(angle) * b;
  return Math.atan2(dx, dz);
}
