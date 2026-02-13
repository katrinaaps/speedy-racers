import { useCallback, useRef, useState } from "react";

export interface CarState {
  angle: number; // position on oval (radians)
  speed: number;
  lane: number; // 0=inner, 1=mid, 2=outer
  laps: number;
  lastCrossed: boolean;
  color: string;
  name: string;
}

const TOTAL_LAPS = 200;

export function useGameState() {
  const [phase, setPhase] = useState<"countdown" | "racing" | "finished">("countdown");
  const [countdown, setCountdown] = useState(3);
  const [winner, setWinner] = useState<string | null>(null);

  const playerRef = useRef<CarState>({
    angle: 0, speed: 0, lane: 1, laps: 0, lastCrossed: false, color: "#3b82f6", name: "You",
  });
  const ai1Ref = useRef<CarState>({
    angle: 0, speed: 0, lane: 0, laps: 0, lastCrossed: false, color: "#eab308", name: "Yellow",
  });
  const ai2Ref = useRef<CarState>({
    angle: 0, speed: 0, lane: 2, laps: 0, lastCrossed: false, color: "#ef4444", name: "Red",
  });

  const reset = useCallback(() => {
    playerRef.current = { angle: 0, speed: 0, lane: 1, laps: 0, lastCrossed: false, color: "#3b82f6", name: "You" };
    ai1Ref.current = { angle: 0, speed: 0, lane: 0, laps: 0, lastCrossed: false, color: "#eab308", name: "Yellow" };
    ai2Ref.current = { angle: 0, speed: 0, lane: 2, laps: 0, lastCrossed: false, color: "#ef4444", name: "Red" };
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
export const TRACK_A = 50; // semi-major axis (x)
export const TRACK_B = 30; // semi-minor axis (z)
export const LANE_WIDTH = 4;

export function getTrackPosition(angle: number, lane: number): [number, number, number] {
  const offset = (lane - 1) * LANE_WIDTH;
  const a = TRACK_A + offset;
  const b = TRACK_B + offset;
  return [Math.cos(angle) * a, 0.5, Math.sin(angle) * b];
}

export function getTrackTangent(angle: number, lane: number): number {
  const offset = (lane - 1) * LANE_WIDTH;
  const a = TRACK_A + offset;
  const b = TRACK_B + offset;
  // tangent direction
  const dx = -Math.sin(angle) * a;
  const dz = Math.cos(angle) * b;
  return Math.atan2(dx, dz);
}
