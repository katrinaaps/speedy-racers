import { useMemo } from "react";
import * as THREE from "three";
import { TRACK_A, TRACK_B, LANE_WIDTH } from "./useGameState";

interface TrackProps {
  level?: number;
}

// Theme configs per level
const LEVEL_THEMES: Record<number, { ground: string; track: string; line: string }> = {
  1: { ground: "#2d5a1e", track: "#444444", line: "#ffffff" },
  2: { ground: "#6b4f3a", track: "#5a5a5a", line: "#dddddd" },
  3: { ground: "#2d5a1e", track: "#333333", line: "#ffffff" },
};

function Mountain({ position, scale, color }: { position: [number, number, number]; scale: number; color: string }) {
  return (
    <mesh position={position}>
      <coneGeometry args={[scale * 6, scale * 14, 6]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
  );
}

function SnowCap({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <mesh position={[position[0], position[1] + scale * 6, position[2]]}>
      <coneGeometry args={[scale * 2.5, scale * 4, 6]} />
      <meshStandardMaterial color="#f0f0f0" flatShading />
    </mesh>
  );
}

function PineTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 3, 6]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>
      {[0, 1.2, 2.2].map((y, i) => (
        <mesh key={i} position={[0, y + 2.5, 0]}>
          <coneGeometry args={[1.8 - i * 0.4, 1.8 - i * 0.3, 6]} />
          <meshStandardMaterial color="#1a4a1a" flatShading />
        </mesh>
      ))}
    </group>
  );
}

function MountainScenery() {
  const mountains = useMemo(() => {
    const m: Array<{ pos: [number, number, number]; scale: number; color: string; snow: boolean }> = [];
    // Ring of mountains around the track
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 + Math.random() * 0.3;
      const dist = 70 + Math.random() * 40;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const scale = 1.5 + Math.random() * 2;
      const colors = ["#5a4a3a", "#6b5b4b", "#4a3a2a", "#7a6a5a"];
      m.push({
        pos: [x, 0, z],
        scale,
        color: colors[i % colors.length],
        snow: scale > 2.2,
      });
    }
    return m;
  }, []);

  const trees = useMemo(() => {
    const t: Array<[number, number, number]> = [];
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = TRACK_A + LANE_WIDTH * 3 + 5 + Math.random() * 20;
      t.push([Math.cos(angle) * dist, 0, Math.sin(angle) * (dist * TRACK_B / TRACK_A)]);
    }
    // Some inside the track
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = TRACK_A - LANE_WIDTH * 3 - 3 - Math.random() * 10;
      if (dist > 2) {
        t.push([Math.cos(angle) * dist, 0, Math.sin(angle) * (dist * TRACK_B / TRACK_A)]);
      }
    }
    return t;
  }, []);

  return (
    <group>
      {mountains.map((m, i) => (
        <group key={`mt-${i}`}>
          <Mountain position={m.pos} scale={m.scale} color={m.color} />
          {m.snow && <SnowCap position={m.pos} scale={m.scale} />}
        </group>
      ))}
      {trees.map((pos, i) => (
        <PineTree key={`tree-${i}`} position={pos} />
      ))}
    </group>
  );
}

export default function Track({ level = 1 }: TrackProps) {
  const theme = LEVEL_THEMES[level] || LEVEL_THEMES[1];

  const trackShape = useMemo(() => {
    const outerA = TRACK_A + LANE_WIDTH * 2;
    const outerB = TRACK_B + LANE_WIDTH * 2;
    const innerA = TRACK_A - LANE_WIDTH * 2;
    const innerB = TRACK_B - LANE_WIDTH * 2;

    const segments = 128;
    const shape = new THREE.Shape();

    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const x = Math.cos(t) * outerA;
      const z = Math.sin(t) * outerB;
      if (i === 0) shape.moveTo(x, z);
      else shape.lineTo(x, z);
    }

    const hole = new THREE.Path();
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const x = Math.cos(t) * innerA;
      const z = Math.sin(t) * innerB;
      if (i === 0) hole.moveTo(x, z);
      else hole.lineTo(x, z);
    }
    shape.holes.push(hole);

    return shape;
  }, []);

  const startX = TRACK_A;
  const startZ = 0;

  return (
    <group>
      {/* Ground */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.1, 0]}>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color={theme.ground} />
      </mesh>

      {/* Track surface */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
        <shapeGeometry args={[trackShape]} />
        <meshStandardMaterial color={theme.track} />
      </mesh>

      {/* Start/finish line */}
      <mesh rotation-x={-Math.PI / 2} position={[startX, 0.01, startZ]}>
        <planeGeometry args={[1, LANE_WIDTH * 4]} />
        <meshStandardMaterial color={theme.line} />
      </mesh>

      {/* Checkerboard pattern on start line */}
      {[...Array(8)].map((_, i) => (
        <mesh
          key={i}
          rotation-x={-Math.PI / 2}
          position={[
            startX + (i % 2 === 0 ? 0.25 : -0.25),
            0.02,
            startZ - LANE_WIDTH * 2 + (i + 0.5) * LANE_WIDTH,
          ]}
        >
          <planeGeometry args={[0.5, LANE_WIDTH / 2]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#000000" : theme.line} />
        </mesh>
      ))}

      {/* Mountain scenery for level 2 */}
      {level === 2 && <MountainScenery />}
    </group>
  );
}
