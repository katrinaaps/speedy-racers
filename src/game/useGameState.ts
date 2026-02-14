import { useCallback, useRef, useState } from "react";

export type BodyStyle = "sedan" | "sport" | "truck" | "formula";

export interface CarState {
  angle: number;
  speed: number;
  lane: number;
  laps: number;
  lastCrossed: boolean;
  color: string;
  name: string;
  bodyStyle: BodyStyle;
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

const AI_BODIES: BodyStyle[] = ["sedan", "sport", "truck", "formula"];
const AI_COLORS = ["#eab308", "#ef4444", "#22c55e", "#a855f7", "#f97316", "#ec4899"];

function randomAIUpgrades(): Partial<CarState> {
  return {
    hasRockets: Math.random() > 0.4,
    hasBigWheels: Math.random() > 0.5,
    hasWings: Math.random() > 0.5,
    hasParachute: Math.random() > 0.6,
    bodyStyle: AI_BODIES[Math.floor(Math.random() * AI_BODIES.length)],
  };
}

function makeCarState(overrides: Partial<CarState>): CarState {
  return {
    angle: 0, speed: 0, lane: 1, laps: 0, lastCrossed: false,
    color: "#3b82f6", name: "You", bodyStyle: "sedan" as BodyStyle,
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
  const ai1Ref = useRef<CarState>(makeCarState({ lane: 0, color: AI_COLORS[Math.floor(Math.random() * AI_COLORS.length)], name: "Yellow", ...randomAIUpgrades() }));
  const ai2Ref = useRef<CarState>(makeCarState({ lane: 2, color: AI_COLORS[Math.floor(Math.random() * AI_COLORS.length)], name: "Red", ...randomAIUpgrades() }));

  const reset = useCallback((keepUpgrades?: boolean) => {
    const prev = playerRef.current;
    playerRef.current = makeCarState({
      lane: 1, color: "#3b82f6", name: "You",
      hasRockets: keepUpgrades ? prev.hasRockets : false,
      hasBigWheels: keepUpgrades ? prev.hasBigWheels : false,
      hasWings: keepUpgrades ? prev.hasWings : false,
      hasParachute: keepUpgrades ? prev.hasParachute : false,
    });
    ai1Ref.current = makeCarState({ lane: 0, color: AI_COLORS[Math.floor(Math.random() * AI_COLORS.length)], name: "Yellow", ...randomAIUpgrades() });
    ai2Ref.current = makeCarState({ lane: 2, color: AI_COLORS[Math.floor(Math.random() * AI_COLORS.length)], name: "Red", ...randomAIUpgrades() });
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
