import { useRef, useMemo, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Track from "./Track";
import Car from "./Car";
import Spectators from "./Spectators";
import Neighborhood from "./Neighborhood";
import Obstacles, { generateObstacles, checkObstacleCollision } from "./Obstacles";
import { CarState, getTrackPosition, getTrackTangent, TRACK_A, TRACK_B, LANE_WIDTH } from "./useGameState";
import {
  BOOST_DURATION, BOOST_COOLDOWN, BOOST_MULTIPLIER,
  WINGS_DURATION, WINGS_COOLDOWN, WINGS_HEIGHT,
  PARACHUTE_DURATION, PARACHUTE_COOLDOWN, PARACHUTE_BRAKE_FACTOR,
  BIG_WHEELS_STEER_MULT, LASER_COOLDOWN, LASER_RANGE,
  ENGINE_SPEED_MULT, PIT_STOP_DURATION, SPIN_OUT_DURATION,
} from "./carUpgrades";

interface GameSceneProps {
  phase: "countdown" | "racing" | "finished";
  playerRef: React.MutableRefObject<CarState>;
  ai1Ref: React.MutableRefObject<CarState>;
  ai2Ref: React.MutableRefObject<CarState>;
  keysRef: React.MutableRefObject<{
    up: boolean; down: boolean; left: boolean; right: boolean;
    boost: boolean; wings: boolean; parachute: boolean; laser: boolean;
  }>;
  onLapUpdate: () => void;
  onWin: (name: string) => void;
  totalLaps: number;
  level: number;
}

const PLAYER_MAX_SPEED = 0.0667;
const PLAYER_ACCEL = 0.0009;
const PLAYER_BRAKE = 0.0015;
const PLAYER_FRICTION = 0.00015;
const STEER_SPEED = 0.03;
const DAMAGED_STEER_MULT = 0.3;
const AI1_SPEED = 0.018;
const AI2_SPEED = 0.020;

function triggerSpinOut(car: CarState) {
  if (car.isSpinningOut || car.inPitStop) return;
  car.isSpinningOut = true;
  car.spinOutTimer = SPIN_OUT_DURATION;
  car.wheelDamaged = true;
}

export default function GameScene({
  phase, playerRef, ai1Ref, ai2Ref, keysRef, onLapUpdate, onWin, totalLaps, level,
}: GameSceneProps) {
  const { camera } = useThree();
  const obstacles = useMemo(() => generateObstacles(level), [level]);

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

  const updateCamera = (p: CarState) => {
    const [px, py, pz] = getTrackPosition(p.angle, p.lane, p.flyHeight);
    const rot = getTrackTangent(p.angle, p.lane);
    const camDist = 15;
    const camHeight = 8;
    const camX = px - Math.sin(rot) * camDist;
    const camZ = pz - Math.cos(rot) * camDist;
    camera.position.lerp(new THREE.Vector3(camX, py + camHeight, camZ), 0.05);
    camera.lookAt(px, py + 1, pz);
  };

  const updateSpinPit = (car: CarState, dt: number): boolean => {
    if (car.isSpinningOut) {
      car.spinOutTimer -= dt;
      car.spinRotation += 0.3 * dt;
      car.speed = Math.max(0, car.speed - 0.003 * dt);
      car.angle += car.speed * dt;
      if (car.spinOutTimer <= 0) {
        car.isSpinningOut = false;
        car.inPitStop = true;
        car.pitStopTimer = PIT_STOP_DURATION;
        car.speed = 0;
        car.spinRotation = 0;
      }
      return true;
    }
    if (car.inPitStop) {
      car.pitStopTimer -= dt;
      car.speed = 0;
      if (car.pitStopTimer <= 0) {
        car.inPitStop = false;
        car.wheelDamaged = false;
        car.wheelDamageTimer = 0;
      }
      return true;
    }
    return false;
  };

  useFrame((_, delta) => {
    if (phase !== "racing") return;
    const clampedDelta = Math.min(delta, 0.05);
    const dt = clampedDelta * 60;

    const p = playerRef.current;
    const k = keysRef.current;
    const allCars = [playerRef.current, ai1Ref.current, ai2Ref.current];

    // --- AI UPDATE FUNCTION ---
    const updateAICar = (car: CarState, baseSpeed: number, variationFn: () => number) => {
      // Check spin/pit first
      if (updateSpinPit(car, dt)) {
        checkLap(car);
        return;
      }

      const variation = variationFn();
      let aiMaxSpeed = baseSpeed * variation;
      if (car.hasUpgradedEngine) aiMaxSpeed *= ENGINE_SPEED_MULT;
      car.speed = aiMaxSpeed;

      // AI wheel damage tick
      if (car.wheelDamaged) {
        car.wheelDamageTimer -= dt;
        car.speed *= 0.6;
        if (car.wheelDamageTimer <= 0) {
          car.wheelDamaged = false;
          car.wheelDamageTimer = 0;
        }
      }

      // AI boost logic
      if (car.boostCooldown > 0) car.boostCooldown -= dt;
      if (car.hasRockets && !car.boostActive && car.boostCooldown <= 0 && Math.random() < 0.005) {
        car.boostActive = true;
        car.boostTimer = BOOST_DURATION;
      }
      let aiSpeedMult = 1;
      if (car.boostActive) {
        car.boostTimer -= dt;
        aiSpeedMult = BOOST_MULTIPLIER;
        if (car.boostTimer <= 0) {
          car.boostActive = false;
          car.boostCooldown = BOOST_COOLDOWN;
        }
      }

      // AI wings logic
      if (car.wingsCooldown > 0) car.wingsCooldown -= dt;
      if (car.hasWings && !car.wingsActive && car.wingsCooldown <= 0 && Math.random() < 0.003) {
        car.wingsActive = true;
        car.wingsTimer = WINGS_DURATION;
      }
      if (car.wingsActive) {
        car.wingsTimer -= dt;
        const progress = 1 - car.wingsTimer / WINGS_DURATION;
        car.flyHeight = Math.sin(progress * Math.PI) * WINGS_HEIGHT;
        if (car.wingsTimer <= 0) {
          car.wingsActive = false;
          car.flyHeight = 0;
          car.wingsCooldown = WINGS_COOLDOWN;
        }
      } else {
        car.flyHeight = Math.max(0, car.flyHeight - 0.3 * dt);
      }

      // AI laser: randomly shoot at other cars
      if (car.laserCooldown > 0) car.laserCooldown -= dt;
      car.laserFiring = false;
      if (car.hasLaser && car.laserCooldown <= 0 && Math.random() < 0.003) {
        car.laserFiring = true;
        car.laserCooldown = LASER_COOLDOWN;
        for (const target of allCars) {
          if (target === car) continue;
          const angleDiff = Math.abs(car.angle - target.angle) % (Math.PI * 2);
          const laneDiff = Math.abs(car.lane - target.lane);
          if (angleDiff < LASER_RANGE && laneDiff < 2) {
            triggerSpinOut(target);
          }
        }
      }

      // AI big wheels
      if (car.hasBigWheels) {
        car.lane = 1 + Math.sin(car.angle * 1.5) * 0.3 * BIG_WHEELS_STEER_MULT * 0.3;
      }

      car.angle += car.speed * dt * aiSpeedMult;
      checkLap(car);
    };

    const updateAllAI = () => {
      updateAICar(ai1Ref.current, AI1_SPEED, () => 1 + Math.sin(ai1Ref.current.angle * 3) * 0.15);
      updateAICar(ai2Ref.current, AI2_SPEED, () => 1 + Math.cos(ai2Ref.current.angle * 2.5) * 0.12);
    };

    // === PLAYER SPIN/PIT CHECK ===
    if (updateSpinPit(p, dt)) {
      checkLap(p);
      updateAllAI();
      updateCamera(p);
      return;
    }

    // Upgraded Engine: higher max speed
    const maxSpeed = p.hasUpgradedEngine ? PLAYER_MAX_SPEED * ENGINE_SPEED_MULT : PLAYER_MAX_SPEED;

    // Acceleration
    if (k.up) p.speed = Math.min(p.speed + PLAYER_ACCEL * dt, maxSpeed);
    else if (k.down) p.speed = Math.max(p.speed - PLAYER_BRAKE * dt, -maxSpeed * 0.3);
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
      p.flyHeight = Math.sin(progress * Math.PI) * WINGS_HEIGHT;
      if (p.wingsTimer <= 0) {
        p.wingsActive = false;
        p.flyHeight = 0;
        p.wingsCooldown = WINGS_COOLDOWN;
      }
    } else {
      p.flyHeight = Math.max(0, p.flyHeight - 0.3 * dt);
    }

    // === WHEEL DAMAGE ===
    if (p.wheelDamaged) {
      p.wheelDamageTimer -= dt;
      if (p.wheelDamageTimer <= 0) {
        p.wheelDamaged = false;
        p.wheelDamageTimer = 0;
      }
    }

    // === LASER ===
    if (p.laserCooldown > 0) p.laserCooldown -= dt;
    p.laserFiring = false;
    if (p.hasLaser && k.laser && p.laserCooldown <= 0) {
      p.laserFiring = true;
      p.laserCooldown = LASER_COOLDOWN;
      const targets = [ai1Ref.current, ai2Ref.current];
      for (const target of targets) {
        const angleDiff = Math.abs(p.angle - target.angle) % (Math.PI * 2);
        const laneDiff = Math.abs(p.lane - target.lane);
        if (angleDiff < LASER_RANGE && laneDiff < 2) {
          triggerSpinOut(target);
        }
      }
    }

    // === STEERING ===
    let steerMult = p.hasBigWheels ? BIG_WHEELS_STEER_MULT : 1;
    if (p.wheelDamaged) steerMult *= DAMAGED_STEER_MULT;
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

    // Obstacle collision
    if (checkObstacleCollision(p.angle, p.lane, p.flyHeight, obstacles)) {
      p.speed *= 0.3;
    }

    checkLap(p);
    updateAllAI();
    updateCamera(p);
  });

  // Level themes
  const themes: Record<number, {
    ambient: number; dirColor: string; dirIntensity: number;
    dirPos: [number,number,number]; fogColor: string; fogNear: number; fogFar: number; skyColor: string;
    hemiSky: string; hemiGround: string; hemiIntensity: number;
  }> = {
    1: { ambient: 0.9, dirColor: "#ffffff", dirIntensity: 1.5, dirPos: [50,60,25], fogColor: "#87ceeb", fogNear: 180, fogFar: 400, skyColor: "#87ceeb", hemiSky: "#bbddff", hemiGround: "#3a7a2a", hemiIntensity: 0.6 },
    2: { ambient: 0.4, dirColor: "#ff9944", dirIntensity: 0.9, dirPos: [20,20,40], fogColor: "#c47a3a", fogNear: 60, fogFar: 200, skyColor: "#d4764e", hemiSky: "#ff8844", hemiGround: "#553322", hemiIntensity: 0.4 },
    3: { ambient: 0.12, dirColor: "#8899cc", dirIntensity: 0.35, dirPos: [30,40,20], fogColor: "#111122", fogNear: 80, fogFar: 250, skyColor: "#0a0a1a", hemiSky: "#223355", hemiGround: "#111111", hemiIntensity: 0.25 },
  };
  const th = themes[level] || themes[1];

  return (
    <>
      <color attach="background" args={[th.skyColor]} />
      <ambientLight intensity={th.ambient} />
      <directionalLight position={th.dirPos} intensity={th.dirIntensity} color={th.dirColor} castShadow />
      <hemisphereLight args={[th.hemiSky, th.hemiGround, th.hemiIntensity]} />
      <fog attach="fog" args={[th.fogColor, th.fogNear, th.fogFar]} />
      {level === 3 && (
        <mesh position={[60, 80, -40]}>
          <sphereGeometry args={[5, 16, 16]} />
          <meshBasicMaterial color="#eeeedd" />
        </mesh>
      )}
      <Track level={level} />
      <Spectators level={level} />
      <Neighborhood />
      <Obstacles obstacles={obstacles} />
      <Car carRef={playerRef} />
      <Car carRef={ai1Ref} />
      <Car carRef={ai2Ref} />
    </>
  );
}
