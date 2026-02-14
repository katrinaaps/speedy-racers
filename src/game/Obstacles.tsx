import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TRACK_A, TRACK_B, LANE_WIDTH, getTrackPosition } from "./useGameState";

// === OBSTACLE TYPES ===

export interface ObstacleData {
  type: "wall" | "log" | "pedestrian";
  angle: number;       // position on the track (radians)
  lane: number;        // which lane (0-2)
  id: number;
}

// Generate random obstacles around the track
export function generateObstacles(): ObstacleData[] {
  const obstacles: ObstacleData[] = [];
  let id = 0;

  // Walls - need wings to fly over (placed at ~6 positions around the track)
  const wallCount = 4;
  for (let i = 0; i < wallCount; i++) {
    const angle = (i / wallCount) * Math.PI * 2 + Math.random() * 0.3;
    const lane = Math.floor(Math.random() * 3); // 0, 1, or 2
    obstacles.push({ type: "wall", angle, lane, id: id++ });
  }

  // Rolling logs - cross the track periodically
  const logCount = 3;
  for (let i = 0; i < logCount; i++) {
    const angle = (i / logCount) * Math.PI * 2 + 0.5 + Math.random() * 0.4;
    obstacles.push({ type: "log", angle, lane: 1, id: id++ });
  }

  // Pedestrians - walk across the track
  const pedCount = 5;
  for (let i = 0; i < pedCount; i++) {
    const angle = (i / pedCount) * Math.PI * 2 + 0.2 + Math.random() * 0.3;
    obstacles.push({ type: "pedestrian", angle, lane: 1, id: id++ });
  }

  return obstacles;
}

// === COLLISION CHECK (used in GameScene) ===
export function checkObstacleCollision(
  carAngle: number,
  carLane: number,
  carFlyHeight: number,
  obstacles: ObstacleData[]
): boolean {
  for (const obs of obstacles) {
    // Check if car is near obstacle angle (within ~0.08 radians)
    const angleDiff = Math.abs(((carAngle % (Math.PI * 2)) - obs.angle + Math.PI * 3) % (Math.PI * 2) - Math.PI);
    if (angleDiff > 0.08) continue;

    if (obs.type === "wall") {
      // Walls block specific lanes - fly over with wings (flyHeight > 3)
      const laneDiff = Math.abs(carLane - obs.lane);
      if (laneDiff < 1.0 && carFlyHeight < 3) return true;
    }

    if (obs.type === "log") {
      // Logs roll across all lanes - fly over or time it
      if (carFlyHeight < 2) return true;
    }

    if (obs.type === "pedestrian") {
      // Pedestrians walk across - slow down or fly over
      if (carFlyHeight < 2) return true;
    }
  }
  return false;
}

// === 3D COMPONENTS ===

function Wall({ angle, lane }: { angle: number; lane: number }) {
  const [x, y, z] = getTrackPosition(angle, lane, 0);
  const tangent = Math.atan2(-Math.sin(angle) * TRACK_A, Math.cos(angle) * TRACK_B);

  return (
    <group position={[x, 0, z]} rotation-y={tangent}>
      {/* Main wall */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[LANE_WIDTH * 0.9, 4, 0.8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Warning stripes */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[(-LANE_WIDTH * 0.3) + i * (LANE_WIDTH * 0.2), 3.5, 0.41]}>
          <boxGeometry args={[0.3, 0.8, 0.02]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#ff0000" : "#ffffff"} />
        </mesh>
      ))}
    </group>
  );
}

function RollingLog({ angle }: { angle: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const logRef = useRef<THREE.Mesh>(null);
  const laneOffset = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (!groupRef.current || !logRef.current) return;
    // Roll the log back and forth across lanes
    const time = Date.now() * 0.001 + laneOffset.current;
    const currentLane = 1 + Math.sin(time * 0.8) * 1.5;
    const [x, y, z] = getTrackPosition(angle, currentLane, 0);
    groupRef.current.position.set(x, 0.5, z);
    // Spin the log
    logRef.current.rotation.z += delta * 3;
  });

  return (
    <group ref={groupRef}>
      <mesh ref={logRef} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.5, 0.5, LANE_WIDTH * 2, 8]} />
        <meshStandardMaterial color="#5C3317" />
      </mesh>
      {/* Bark rings */}
      {[-1.5, 0, 1.5].map((offset, i) => (
        <mesh key={i} position={[0, 0, offset]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.5, 0.05, 6, 12]} />
          <meshStandardMaterial color="#3E2110" />
        </mesh>
      ))}
    </group>
  );
}

function Pedestrian({ angle }: { angle: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const walkOffset = useRef(Math.random() * Math.PI * 2);
  const walkSpeed = useRef(0.3 + Math.random() * 0.4);
  const shirtColor = useMemo(() => {
    const colors = ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6", "#e67e22"];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    const time = Date.now() * 0.001 * walkSpeed.current + walkOffset.current;
    const currentLane = 1 + Math.sin(time) * 2;
    const [x, , z] = getTrackPosition(angle, currentLane, 0);
    groupRef.current.position.set(x, 0, z);

    // Walking animation - bob up and down
    groupRef.current.position.y = Math.abs(Math.sin(time * 4)) * 0.15;
  });

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.5, 1.0, 0.3]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshStandardMaterial color="#f5d6b8" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.12, 0.1, 0]}>
        <boxGeometry args={[0.18, 0.4, 0.2]} />
        <meshStandardMaterial color="#1a1a8a" />
      </mesh>
      <mesh position={[0.12, 0.1, 0]}>
        <boxGeometry args={[0.18, 0.4, 0.2]} />
        <meshStandardMaterial color="#1a1a8a" />
      </mesh>
    </group>
  );
}

// === MAIN OBSTACLES COMPONENT ===

interface ObstaclesProps {
  obstacles: ObstacleData[];
}

export default function Obstacles({ obstacles }: ObstaclesProps) {
  return (
    <group>
      {obstacles.map((obs) => {
        switch (obs.type) {
          case "wall":
            return <Wall key={obs.id} angle={obs.angle} lane={obs.lane} />;
          case "log":
            return <RollingLog key={obs.id} angle={obs.angle} />;
          case "pedestrian":
            return <Pedestrian key={obs.id} angle={obs.angle} />;
        }
      })}
    </group>
  );
}
