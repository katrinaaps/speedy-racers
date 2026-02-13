import { useMemo } from "react";
import * as THREE from "three";
import { TRACK_A, TRACK_B, LANE_WIDTH } from "./useGameState";

// Generate spectator positions around the track
function generateSpectatorPositions(): Array<{ x: number; z: number; side: "outer" | "inner" }> {
  const positions: Array<{ x: number; z: number; side: "outer" | "inner" }> = [];
  const outerDist = LANE_WIDTH * 2.5 + 3; // outside the track
  const innerDist = LANE_WIDTH * 2.5 + 3; // inside the track
  const count = 60;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    // Outer spectators
    const ox = Math.cos(angle) * (TRACK_A + outerDist + Math.random() * 4);
    const oz = Math.sin(angle) * (TRACK_B + outerDist + Math.random() * 4);
    positions.push({ x: ox, z: oz, side: "outer" });
    // Inner spectators (fewer)
    if (i % 2 === 0) {
      const ix = Math.cos(angle) * (TRACK_A - innerDist - Math.random() * 3);
      const iz = Math.sin(angle) * (TRACK_B - innerDist - Math.random() * 3);
      positions.push({ x: ix, z: iz, side: "inner" });
    }
  }
  return positions;
}

const SPECTATOR_COLORS = [
  "#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6",
  "#e67e22", "#1abc9c", "#ecf0f1", "#ff6b6b", "#a29bfe",
];

function Spectator({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      {/* Body */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.4, 1.2, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.2, 6, 6]} />
        <meshStandardMaterial color="#f5d6b8" />
      </mesh>
    </group>
  );
}

export default function Spectators() {
  const spectators = useMemo(() => {
    return generateSpectatorPositions().map((s, i) => ({
      key: i,
      position: [s.x, 0, s.z] as [number, number, number],
      color: SPECTATOR_COLORS[i % SPECTATOR_COLORS.length],
    }));
  }, []);

  return (
    <group>
      {spectators.map((s) => (
        <Spectator key={s.key} position={s.position} color={s.color} />
      ))}
      {/* Bleacher stands at the straights */}
      {[
        [TRACK_A + 18, 0, 0] as [number, number, number],
        [-(TRACK_A + 18), 0, 0] as [number, number, number],
      ].map((pos, i) => (
        <mesh key={`stand-${i}`} position={[pos[0], 1, pos[2]]}>
          <boxGeometry args={[6, 2, 20]} />
          <meshStandardMaterial color="#888888" />
        </mesh>
      ))}
    </group>
  );
}
