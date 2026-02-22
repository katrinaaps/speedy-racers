import { useMemo } from "react";
import * as THREE from "three";
import { TRACK_A, TRACK_B, LANE_WIDTH } from "./useGameState";

interface SpectatorsProps {
  level?: number;
}

// Generate spectator positions around the track
function generateSpectatorPositions(): Array<{ x: number; z: number; side: "outer" | "inner" }> {
  const positions: Array<{ x: number; z: number; side: "outer" | "inner" }> = [];
  const outerDist = LANE_WIDTH * 2.5 + 3;
  const innerDist = LANE_WIDTH * 2.5 + 3;
  const count = 60;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const ox = Math.cos(angle) * (TRACK_A + outerDist + Math.random() * 4);
    const oz = Math.sin(angle) * (TRACK_B + outerDist + Math.random() * 4);
    positions.push({ x: ox, z: oz, side: "outer" });
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
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.4, 1.2, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.2, 6, 6]} />
        <meshStandardMaterial color="#f5d6b8" />
      </mesh>
    </group>
  );
}

function Grandstands() {
  return (
    <>
      {[
        { pos: [TRACK_A + 20, 0, 0] as [number, number, number], rotY: Math.PI / 2 },
        { pos: [-(TRACK_A + 20), 0, 0] as [number, number, number], rotY: -Math.PI / 2 },
        { pos: [0, 0, TRACK_B + 16] as [number, number, number], rotY: 0 },
        { pos: [0, 0, -(TRACK_B + 16)] as [number, number, number], rotY: Math.PI },
      ].map((stand, i) => (
        <group key={`stand-${i}`} position={stand.pos} rotation-y={stand.rotY}>
          {[0, 1, 2, 3].map((row) => (
            <group key={`row-${row}`}>
              <mesh position={[0, row * 2 + 0.5, row * 1.5]}>
                <boxGeometry args={[24, 0.4, 2.5]} />
                <meshStandardMaterial color="#999999" />
              </mesh>
              <mesh position={[0, row * 2 + 1.2, row * 1.5 + 1.1]}>
                <boxGeometry args={[24, 1, 0.2]} />
                <meshStandardMaterial color="#777777" />
              </mesh>
            </group>
          ))}
          {[-10, -5, 0, 5, 10].map((xOff, j) => (
            <mesh key={`support-${j}`} position={[xOff, 3, 3]}>
              <boxGeometry args={[0.5, 8, 8]} />
              <meshStandardMaterial color="#666666" />
            </mesh>
          ))}
          <mesh position={[0, 8.5, 4]}>
            <boxGeometry args={[26, 0.3, 10]} />
            <meshStandardMaterial color="#555555" />
          </mesh>
          {[-12, 12].map((xOff, j) => (
            <mesh key={`roof-support-${j}`} position={[xOff, 5, 4]}>
              <boxGeometry args={[0.4, 7, 0.4]} />
              <meshStandardMaterial color="#444444" />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}

export default function Spectators({ level = 1 }: SpectatorsProps) {
  const spectators = useMemo(() => {
    // Level 2 (mountains) has fewer spectators, no grandstands
    const positions = generateSpectatorPositions();
    const filtered = level === 2 ? positions.filter((_, i) => i % 4 === 0) : positions;
    return filtered.map((s, i) => ({
      key: i,
      position: [s.x, 0, s.z] as [number, number, number],
      color: SPECTATOR_COLORS[i % SPECTATOR_COLORS.length],
    }));
  }, [level]);

  return (
    <group>
      {spectators.map((s) => (
        <Spectator key={s.key} position={s.position} color={s.color} />
      ))}
      {/* Grandstands only for levels 1 and 3 */}
      {level !== 2 && <Grandstands />}
    </group>
  );
}
