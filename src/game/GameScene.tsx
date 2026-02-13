import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Track from "./Track";
import Car from "./Car";
import { CarState, getTrackPosition, getTrackTangent, TRACK_A, TRACK_B, LANE_WIDTH } from "./useGameState";

interface GameSceneProps {
  phase: "countdown" | "racing" | "finished";
  playerRef: React.MutableRefObject<CarState>;
  ai1Ref: React.MutableRefObject<CarState>;
  ai2Ref: React.MutableRefObject<CarState>;
  keysRef: React.MutableRefObject<{ up: boolean; down: boolean; left: boolean; right: boolean }>;
  onLapUpdate: () => void;
  onWin: (name: string) => void;
  totalLaps: number;
}

const PLAYER_MAX_SPEED = 0.045;
const PLAYER_ACCEL = 0.0006;
const PLAYER_BRAKE = 0.001;
const PLAYER_FRICTION = 0.00012;
const STEER_SPEED = 0.03;
const AI1_SPEED = 0.018;
const AI2_SPEED = 0.020;

export default function GameScene({
  phase, playerRef, ai1Ref, ai2Ref, keysRef, onLapUpdate, onWin, totalLaps,
}: GameSceneProps) {
  const { camera } = useThree();

  const checkLap = (car: CarState) => {
    // Crossed start line when angle wraps past 2*PI
    const crossed = car.angle >= Math.PI * 2;
    if (crossed && !car.lastCrossed) {
      car.laps++;
      car.lastCrossed = true;
      car.angle -= Math.PI * 2;
      onLapUpdate();
      if (car.laps >= totalLaps) {
        onWin(car.name);
      }
    }
    if (!crossed) {
      car.lastCrossed = false;
    }
  };

  useFrame((_, delta) => {
    if (phase !== "racing") return;
    const clampedDelta = Math.min(delta, 0.05);
    const dt = clampedDelta * 60;

    // Player
    const p = playerRef.current;
    const k = keysRef.current;
    if (k.up) p.speed = Math.min(p.speed + PLAYER_ACCEL * dt, PLAYER_MAX_SPEED);
    else if (k.down) p.speed = Math.max(p.speed - PLAYER_BRAKE * dt, -PLAYER_MAX_SPEED * 0.3);
    else p.speed = Math.max(0, p.speed - PLAYER_FRICTION * dt);

    if (k.left) p.lane = Math.max(p.lane - STEER_SPEED * dt, -1.5);
    if (k.right) p.lane = Math.min(p.lane + STEER_SPEED * dt, 2.5);

    // Adjust speed based on lane (outer lanes = longer path, need more angle speed to keep up)
    const offset = (p.lane - 1) * LANE_WIDTH;
    const effectiveA = TRACK_A + offset;
    const effectiveB = TRACK_B + offset;
    const circumApprox = Math.PI * (3 * (effectiveA + effectiveB) - Math.sqrt((3 * effectiveA + effectiveB) * (effectiveA + 3 * effectiveB)));
    const baseCircum = Math.PI * (3 * (TRACK_A + TRACK_B) - Math.sqrt((3 * TRACK_A + TRACK_B) * (TRACK_A + 3 * TRACK_B)));
    const laneScale = baseCircum / circumApprox;

    p.angle += p.speed * dt * laneScale;
    checkLap(p);

    // AI 1
    const a1 = ai1Ref.current;
    const ai1Variation = 1 + Math.sin(a1.angle * 3) * 0.15;
    a1.speed = AI1_SPEED * ai1Variation;
    a1.angle += a1.speed * dt;
    checkLap(a1);

    // AI 2
    const a2 = ai2Ref.current;
    const ai2Variation = 1 + Math.cos(a2.angle * 2.5) * 0.12;
    a2.speed = AI2_SPEED * ai2Variation;
    a2.angle += a2.speed * dt;
    checkLap(a2);

    // Camera follows player
    const [px, py, pz] = getTrackPosition(p.angle, p.lane);
    const rot = getTrackTangent(p.angle, p.lane);
    const camDist = 15;
    const camHeight = 8;
    const camX = px - Math.sin(rot) * camDist;
    const camZ = pz - Math.cos(rot) * camDist;
    camera.position.lerp(new THREE.Vector3(camX, py + camHeight, camZ), 0.05);
    camera.lookAt(px, py + 1, pz);
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[50, 50, 25]} intensity={1} castShadow />
      <Track />
      <Car carRef={playerRef} />
      <Car carRef={ai1Ref} />
      <Car carRef={ai2Ref} />
    </>
  );
}
