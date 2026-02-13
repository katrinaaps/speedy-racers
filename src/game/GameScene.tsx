import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Track from "./Track";
import Car from "./Car";
import Spectators from "./Spectators";
import { CarState, getTrackPosition, getTrackTangent, TRACK_A, TRACK_B, LANE_WIDTH } from "./useGameState";
import {
  BOOST_DURATION, BOOST_COOLDOWN, BOOST_MULTIPLIER,
  WINGS_DURATION, WINGS_COOLDOWN, WINGS_HEIGHT,
  PARACHUTE_DURATION, PARACHUTE_COOLDOWN, PARACHUTE_BRAKE_FACTOR,
  BIG_WHEELS_STEER_MULT,
} from "./carUpgrades";

interface GameSceneProps {
  phase: "countdown" | "racing" | "finished";
  playerRef: React.MutableRefObject<CarState>;
  ai1Ref: React.MutableRefObject<CarState>;
  ai2Ref: React.MutableRefObject<CarState>;
  keysRef: React.MutableRefObject<{
    up: boolean; down: boolean; left: boolean; right: boolean;
    boost: boolean; wings: boolean; parachute: boolean;
  }>;
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

    const p = playerRef.current;
    const k = keysRef.current;

    // Acceleration
    if (k.up) p.speed = Math.min(p.speed + PLAYER_ACCEL * dt, PLAYER_MAX_SPEED);
    else if (k.down) p.speed = Math.max(p.speed - PLAYER_BRAKE * dt, -PLAYER_MAX_SPEED * 0.3);
    else p.speed = Math.max(0, p.speed - PLAYER_FRICTION * dt);

    // === BOOST ===
    if (p.boostCooldown > 0) p.boostCooldown -= dt;
    if (p.hasRockets && k.boost && !p.boostActive && p.boostCooldown <= 0) {
      p.boostActive = true;
      p.boostTimer = BOOST_DURATION;
    }
    let speedMult = 1;
    if (p.boostActive) {
      p.boostTimer -= dt;
      speedMult = BOOST_MULTIPLIER;
      if (p.boostTimer <= 0) {
        p.boostActive = false;
        p.boostCooldown = BOOST_COOLDOWN;
      }
    }

    // === PARACHUTE ===
    if (p.parachuteCooldown > 0) p.parachuteCooldown -= dt;
    if (p.hasParachute && k.parachute && !p.parachuteActive && p.parachuteCooldown <= 0 && p.speed > 0.005) {
      p.parachuteActive = true;
      p.parachuteTimer = PARACHUTE_DURATION;
    }
    if (p.parachuteActive) {
      p.parachuteTimer -= dt;
      p.speed *= (1 - PARACHUTE_BRAKE_FACTOR * (dt / 60));
      if (p.speed < 0.001) p.speed = 0;
      if (p.parachuteTimer <= 0) {
        p.parachuteActive = false;
        p.parachuteCooldown = PARACHUTE_COOLDOWN;
      }
    }

    // === WINGS ===
    if (p.wingsCooldown > 0) p.wingsCooldown -= dt;
    if (p.hasWings && k.wings && !p.wingsActive && p.wingsCooldown <= 0) {
      p.wingsActive = true;
      p.wingsTimer = WINGS_DURATION;
    }
    if (p.wingsActive) {
      p.wingsTimer -= dt;
      const progress = 1 - p.wingsTimer / WINGS_DURATION;
      // Arc: go up then come down
      p.flyHeight = Math.sin(progress * Math.PI) * WINGS_HEIGHT;
      if (p.wingsTimer <= 0) {
        p.wingsActive = false;
        p.flyHeight = 0;
        p.wingsCooldown = WINGS_COOLDOWN;
      }
    } else {
      p.flyHeight = Math.max(0, p.flyHeight - 0.3 * dt); // safety descent
    }

    // === STEERING ===
    const steerMult = p.hasBigWheels ? BIG_WHEELS_STEER_MULT : 1;
    if (k.left) p.lane = Math.max(p.lane - STEER_SPEED * steerMult * dt, -1.5);
    if (k.right) p.lane = Math.min(p.lane + STEER_SPEED * steerMult * dt, 2.5);

    // Lane-based speed adjustment
    const offset = (p.lane - 1) * LANE_WIDTH;
    const effectiveA = TRACK_A + offset;
    const effectiveB = TRACK_B + offset;
    const circumApprox = Math.PI * (3 * (effectiveA + effectiveB) - Math.sqrt((3 * effectiveA + effectiveB) * (effectiveA + 3 * effectiveB)));
    const baseCircum = Math.PI * (3 * (TRACK_A + TRACK_B) - Math.sqrt((3 * TRACK_A + TRACK_B) * (TRACK_A + 3 * TRACK_B)));
    const laneScale = baseCircum / circumApprox;

    p.angle += p.speed * dt * laneScale * speedMult;
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
    const [px, py, pz] = getTrackPosition(p.angle, p.lane, p.flyHeight);
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
      <Spectators />
      <Car carRef={playerRef} />
      <Car carRef={ai1Ref} />
      <Car carRef={ai2Ref} />
    </>
  );
}
