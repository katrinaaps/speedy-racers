import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TRACK_A, TRACK_B, LANE_WIDTH } from "./useGameState";

interface SpectatorsProps {
  level?: number;
}

const SPECTATOR_COLORS = [
  "#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6",
  "#e67e22", "#1abc9c", "#ecf0f1", "#ff6b6b", "#a29bfe",
  "#ff9ff3", "#54a0ff", "#5f27cd", "#01a3a4", "#feca57",
];

const SKIN_TONES = ["#f5d6b8", "#d4a574", "#8d5524", "#c68642", "#e0ac69"];
const HAIR_COLORS = ["#2c1810", "#654321", "#d4a017", "#8b0000", "#1a1a1a", "#c0c0c0"];

function SeatedSpectator({ position, color, skinTone, hairColor }: {
  position: [number, number, number];
  color: string;
  skinTone: string;
  hairColor: string;
}) {
  return (
    <group position={position}>
      {/* Legs (seated) */}
      <mesh position={[0, 0.15, 0.15]}>
        <boxGeometry args={[0.35, 0.15, 0.4]} />
        <meshStandardMaterial color="#333344" />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.35, 0.5, 0.25]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Arms */}
      {[-0.22, 0.22].map((x, i) => (
        <mesh key={`arm-${i}`} position={[x, 0.45, 0]}>
          <boxGeometry args={[0.1, 0.35, 0.12]} />
          <meshStandardMaterial color={skinTone} />
        </mesh>
      ))}
      {/* Head */}
      <mesh position={[0, 0.88, 0]}>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshStandardMaterial color={skinTone} />
      </mesh>
      {/* Hair */}
      <mesh position={[0, 0.96, -0.02]}>
        <sphereGeometry args={[0.12, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={hairColor} />
      </mesh>
    </group>
  );
}

function Grandstand({ position, rotY, rowCount = 5, seatsPerRow = 16 }: {
  position: [number, number, number];
  rotY: number;
  rowCount?: number;
  seatsPerRow?: number;
}) {
  const spectators = useMemo(() => {
    const specs: Array<{
      pos: [number, number, number];
      color: string;
      skin: string;
      hair: string;
    }> = [];
    for (let row = 0; row < rowCount; row++) {
      for (let seat = 0; seat < seatsPerRow; seat++) {
        if (Math.random() > 0.15) { // 85% occupancy
          const x = -((seatsPerRow - 1) * 0.7) / 2 + seat * 0.7 + (Math.random() - 0.5) * 0.1;
          const y = row * 1.6 + 0.5;
          const z = row * 1.2;
          specs.push({
            pos: [x, y, z],
            color: SPECTATOR_COLORS[Math.floor(Math.random() * SPECTATOR_COLORS.length)],
            skin: SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)],
            hair: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
          });
        }
      }
    }
    return specs;
  }, [rowCount, seatsPerRow]);

  return (
    <group position={position} rotation-y={rotY}>
      {/* Tiered seating structure */}
      {Array.from({ length: rowCount }, (_, row) => (
        <group key={`row-${row}`}>
          {/* Seat platform */}
          <mesh position={[0, row * 1.6 + 0.25, row * 1.2]}>
            <boxGeometry args={[seatsPerRow * 0.72, 0.3, 1.4]} />
            <meshStandardMaterial color="#888888" metalness={0.3} roughness={0.7} />
          </mesh>
          {/* Back rest */}
          <mesh position={[0, row * 1.6 + 0.7, row * 1.2 + 0.65]}>
            <boxGeometry args={[seatsPerRow * 0.72, 0.6, 0.08]} />
            <meshStandardMaterial color="#666666" metalness={0.2} roughness={0.7} />
          </mesh>
          {/* Seat dividers */}
          {Array.from({ length: Math.floor(seatsPerRow / 2) + 1 }, (_, j) => (
            <mesh key={`div-${j}`} position={[-((seatsPerRow - 1) * 0.7) / 2 + j * 1.4 - 0.35, row * 1.6 + 0.25, row * 1.2 + 0.65]}>
              <boxGeometry args={[0.04, 0.6, 0.08]} />
              <meshStandardMaterial color="#555555" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Support pillars */}
      {Array.from({ length: 6 }, (_, i) => {
        const x = -((seatsPerRow - 1) * 0.7) / 2 + i * ((seatsPerRow - 1) * 0.7 / 5);
        return (
          <mesh key={`pillar-${i}`} position={[x, rowCount * 0.8, rowCount * 0.6]}>
            <boxGeometry args={[0.3, rowCount * 1.8, 0.3]} />
            <meshStandardMaterial color="#555555" metalness={0.4} roughness={0.6} />
          </mesh>
        );
      })}

      {/* Roof */}
      <mesh position={[0, rowCount * 1.6 + 1, rowCount * 0.6]}>
        <boxGeometry args={[seatsPerRow * 0.75, 0.15, rowCount * 1.4]} />
        <meshStandardMaterial color="#444444" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Safety railing at front */}
      <mesh position={[0, 0.8, -0.5]}>
        <boxGeometry args={[seatsPerRow * 0.72, 0.06, 0.06]} />
        <meshStandardMaterial color="#cccccc" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Railing posts */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={`rpost-${i}`} position={[-((seatsPerRow - 1) * 0.7) / 2 + i * ((seatsPerRow - 1) * 0.7 / 7), 0.45, -0.5]}>
          <boxGeometry args={[0.05, 0.8, 0.05]} />
          <meshStandardMaterial color="#cccccc" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Seated spectators */}
      {spectators.map((s, i) => (
        <SeatedSpectator
          key={`spec-${i}`}
          position={s.pos}
          color={s.color}
          skinTone={s.skin}
          hairColor={s.hair}
        />
      ))}
    </group>
  );
}

// Ambient traffic cars driving on a road outside the track
function AmbientTraffic() {
  const carsRef = useRef<Array<{ angle: number; speed: number; color: string; lane: number }>>([]);

  if (carsRef.current.length === 0) {
    const colors = ["#cc2222", "#2255cc", "#228822", "#cccc22", "#ffffff", "#222222", "#cc8822", "#8822cc"];
    for (let i = 0; i < 8; i++) {
      carsRef.current.push({
        angle: (i / 8) * Math.PI * 2,
        speed: 0.003 + Math.random() * 0.002,
        color: colors[i % colors.length],
        lane: Math.random() > 0.5 ? 0 : 1,
      });
    }
  }

  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    carsRef.current.forEach((car, i) => {
      car.angle += car.speed * (car.lane === 0 ? 1 : -1);
      const dist = TRACK_A + 28 + car.lane * 4;
      const distB = TRACK_B + 22 + car.lane * 4;
      const x = Math.cos(car.angle) * dist;
      const z = Math.sin(car.angle) * distB;
      const child = groupRef.current!.children[i];
      if (child) {
        child.position.set(x, 0.3, z);
        const dx = -Math.sin(car.angle) * dist;
        const dz = Math.cos(car.angle) * distB;
        child.rotation.y = Math.atan2(dx, dz) + (car.lane === 0 ? Math.PI : 0);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {carsRef.current.map((car, i) => (
        <group key={`traffic-${i}`}>
          {/* Simple car body */}
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[1.4, 0.5, 3]} />
            <meshStandardMaterial color={car.color} metalness={0.4} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.55, -0.1]}>
            <boxGeometry args={[1.2, 0.35, 1.4]} />
            <meshStandardMaterial color={car.color} metalness={0.3} roughness={0.5} />
          </mesh>
          {/* Windshield */}
          <mesh position={[0, 0.55, -0.85]} rotation-x={0.3}>
            <boxGeometry args={[1.1, 0.3, 0.04]} />
            <meshStandardMaterial color="#1a2a3a" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
          </mesh>
          {/* Headlights */}
          {[-0.5, 0.5].map((x, j) => (
            <mesh key={`thl-${j}`} position={[x, 0.25, -1.52]}>
              <sphereGeometry args={[0.08, 6, 6]} />
              <meshStandardMaterial color="#ffffcc" emissive="#ffffaa" emissiveIntensity={0.3} />
            </mesh>
          ))}
          {/* Taillights */}
          {[-0.5, 0.5].map((x, j) => (
            <mesh key={`ttl-${j}`} position={[x, 0.25, 1.52]}>
              <sphereGeometry args={[0.06, 6, 6]} />
              <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={0.3} />
            </mesh>
          ))}
          {/* Wheels */}
          {[[-0.65, 0, 0.9], [0.65, 0, 0.9], [-0.65, 0, -0.9], [0.65, 0, -0.9]].map((pos, j) => (
            <mesh key={`tw-${j}`} position={pos as [number, number, number]} rotation-z={Math.PI / 2}>
              <cylinderGeometry args={[0.25, 0.25, 0.18, 10]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// Road for ambient traffic
function TrafficRoad() {
  const roadShape = useMemo(() => {
    const outerDist = TRACK_A + 34;
    const outerDistB = TRACK_B + 28;
    const innerDist = TRACK_A + 26;
    const innerDistB = TRACK_B + 20;
    const segments = 64;
    const shape = new THREE.Shape();

    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const x = Math.cos(t) * outerDist;
      const z = Math.sin(t) * outerDistB;
      if (i === 0) shape.moveTo(x, z);
      else shape.lineTo(x, z);
    }
    const hole = new THREE.Path();
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const x = Math.cos(t) * innerDist;
      const z = Math.sin(t) * innerDistB;
      if (i === 0) hole.moveTo(x, z);
      else hole.lineTo(x, z);
    }
    shape.holes.push(hole);
    return shape;
  }, []);

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
      <shapeGeometry args={[roadShape]} />
      <meshStandardMaterial color="#3a3a3a" />
    </mesh>
  );
}

export default function Spectators({ level = 1 }: SpectatorsProps) {
  // Stands closer to the track
  const standOffset = 12;

  const stands = useMemo(() => [
    { pos: [TRACK_A + standOffset, 0, 0] as [number, number, number], rotY: Math.PI / 2, seats: 18, rows: 5 },
    { pos: [-(TRACK_A + standOffset), 0, 0] as [number, number, number], rotY: -Math.PI / 2, seats: 18, rows: 5 },
    { pos: [0, 0, TRACK_B + standOffset - 2] as [number, number, number], rotY: 0, seats: 14, rows: 4 },
    { pos: [0, 0, -(TRACK_B + standOffset - 2)] as [number, number, number], rotY: Math.PI, seats: 14, rows: 4 },
  ], []);

  return (
    <group>
      {/* Grandstands with seated spectators — levels 1 and 3 */}
      {level !== 2 && stands.map((s, i) => (
        <Grandstand
          key={`stand-${i}`}
          position={s.pos}
          rotY={s.rotY}
          rowCount={s.rows}
          seatsPerRow={s.seats}
        />
      ))}
      {/* Fewer spectators for mountain level */}
      {level === 2 && (
        <Grandstand
          position={[TRACK_A + standOffset, 0, 0]}
          rotY={Math.PI / 2}
          rowCount={3}
          seatsPerRow={10}
        />
      )}
      {/* Ambient traffic road and cars */}
      {level !== 2 && (
        <>
          <TrafficRoad />
          <AmbientTraffic />
        </>
      )}
    </group>
  );
}
