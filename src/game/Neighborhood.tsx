import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TRACK_A, TRACK_B, LANE_WIDTH } from "./useGameState";

// ========== TREES ==========
function Tree({ position }: { position: [number, number, number] }) {
  const { height, crownSize, crownColor } = useMemo(() => ({
    height: 2 + Math.random() * 2,
    crownSize: 1.2 + Math.random() * 0.5,
    crownColor: Math.random() > 0.5 ? "#2d6b1e" : "#1e8a1e",
  }), []);
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.12, 0.18, height, 6]} />
        <meshStandardMaterial color="#5a3a1a" />
      </mesh>
      <mesh position={[0, height + 0.8, 0]}>
        <sphereGeometry args={[crownSize, 8, 6]} />
        <meshStandardMaterial color={crownColor} />
      </mesh>
      <mesh position={[0.3, height + 0.3, 0.3]}>
        <sphereGeometry args={[0.8, 6, 5]} />
        <meshStandardMaterial color="#3a8a2a" />
      </mesh>
    </group>
  );
}

// ========== HOUSE ==========
function House({ position, rotY, color, roofColor, hasLight }: {
  position: [number, number, number]; rotY: number;
  color: string; roofColor: string; hasLight: boolean;
}) {
  const lightRef = useRef<THREE.PointLight>(null);
  const windowRef = useRef<THREE.Mesh>(null);
  const flickerRef = useRef(Math.random() * 100);

  useFrame((_, delta) => {
    if (!hasLight) return;
    flickerRef.current += delta;
    const on = Math.sin(flickerRef.current * 0.3) > -0.3;
    if (lightRef.current) lightRef.current.intensity = on ? 2 : 0;
    if (windowRef.current) {
      (windowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = on ? 0.8 : 0;
    }
  });

  return (
    <group position={position} rotation-y={rotY}>
      {/* Main body */}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[4, 3.6, 3.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 3.9, 0]} rotation-z={0}>
        <coneGeometry args={[3.2, 1.8, 4]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>
      {/* Door */}
      <mesh position={[0, 0.8, 1.76]}>
        <boxGeometry args={[0.7, 1.6, 0.05]} />
        <meshStandardMaterial color="#5a3520" />
      </mesh>
      {/* Door knob */}
      <mesh position={[0.2, 0.7, 1.79]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial color="#ccaa00" metalness={0.8} />
      </mesh>
      {/* Windows */}
      {[[-1.2, 2.2, 1.76], [1.2, 2.2, 1.76]].map((pos, i) => (
        <mesh key={`win-${i}`} ref={i === 0 ? windowRef : undefined} position={pos as [number, number, number]}>
          <boxGeometry args={[0.8, 0.8, 0.06]} />
          <meshStandardMaterial
            color="#88bbdd"
            emissive="#ffdd88"
            emissiveIntensity={hasLight ? 0.8 : 0}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
      {/* Window frames */}
      {[[-1.2, 2.2, 1.77], [1.2, 2.2, 1.77]].map((pos, i) => (
        <group key={`wf-${i}`} position={pos as [number, number, number]}>
          <mesh><boxGeometry args={[0.85, 0.05, 0.02]} /><meshStandardMaterial color="#ffffff" /></mesh>
          <mesh><boxGeometry args={[0.05, 0.85, 0.02]} /><meshStandardMaterial color="#ffffff" /></mesh>
        </group>
      ))}
      {/* Light inside */}
      {hasLight && (
        <pointLight ref={lightRef} position={[0, 2, 0.5]} intensity={2} color="#ffdd88" distance={8} />
      )}
      {/* Chimney */}
      <mesh position={[1.2, 4.5, -0.5]}>
        <boxGeometry args={[0.5, 1.2, 0.5]} />
        <meshStandardMaterial color="#884444" />
      </mesh>
    </group>
  );
}

// ========== STORE ==========
function Store({ position, rotY, name, wallColor, signColor }: {
  position: [number, number, number]; rotY: number;
  name: string; wallColor: string; signColor: string;
}) {
  return (
    <group position={position} rotation-y={rotY}>
      {/* Building */}
      <mesh position={[0, 2.2, 0]}>
        <boxGeometry args={[6, 4.4, 4]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      {/* Flat roof */}
      <mesh position={[0, 4.45, 0]}>
        <boxGeometry args={[6.3, 0.15, 4.3]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      {/* Sign board */}
      <mesh position={[0, 3.8, 2.02]}>
        <boxGeometry args={[5, 0.8, 0.1]} />
        <meshStandardMaterial color={signColor} />
      </mesh>
      {/* Sign text approximation - colored stripe */}
      <mesh position={[0, 3.8, 2.08]}>
        <boxGeometry args={[4.2, 0.4, 0.02]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>
      {/* Store front glass */}
      <mesh position={[0, 1.2, 2.02]}>
        <boxGeometry args={[4, 2.2, 0.05]} />
        <meshStandardMaterial color="#aaddee" transparent opacity={0.5} metalness={0.6} roughness={0.1} />
      </mesh>
      {/* Door */}
      <mesh position={[0, 0.9, 2.04]}>
        <boxGeometry args={[1.2, 1.8, 0.06]} />
        <meshStandardMaterial color="#447799" transparent opacity={0.6} />
      </mesh>
      {/* Awning */}
      <mesh position={[0, 2.5, 2.8]} rotation-x={-0.3}>
        <boxGeometry args={[5.5, 0.05, 1.2]} />
        <meshStandardMaterial color={signColor} />
      </mesh>
      {/* Interior light glow */}
      <pointLight position={[0, 2, 1]} intensity={1.5} color="#ffffee" distance={6} />
    </group>
  );
}

// ========== WALKING PERSON ==========
function WalkingPerson({ pathCenter, pathRadius, pathRadiusB, speed, color, skinTone }: {
  pathCenter: [number, number, number]; pathRadius: number; pathRadiusB: number;
  speed: number; color: string; skinTone: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const angleRef = useRef(Math.random() * Math.PI * 2);
  const bobRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    angleRef.current += speed * delta;
    bobRef.current += delta * 8;
    const x = pathCenter[0] + Math.cos(angleRef.current) * pathRadius;
    const z = pathCenter[2] + Math.sin(angleRef.current) * pathRadiusB;
    const bob = Math.abs(Math.sin(bobRef.current)) * 0.08;
    groupRef.current.position.set(x, bob, z);
    const dx = -Math.sin(angleRef.current) * pathRadius;
    const dz = Math.cos(angleRef.current) * pathRadiusB;
    groupRef.current.rotation.y = Math.atan2(dx, dz);
  });

  return (
    <group ref={groupRef}>
      {/* Legs */}
      {[-0.08, 0.08].map((x, i) => (
        <mesh key={`leg-${i}`} position={[x, 0.4, 0]}>
          <boxGeometry args={[0.12, 0.8, 0.12]} />
          <meshStandardMaterial color="#333355" />
        </mesh>
      ))}
      {/* Body */}
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[0.35, 0.6, 0.22]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Arms */}
      {[-0.24, 0.24].map((x, i) => (
        <mesh key={`arm-${i}`} position={[x, 1, 0]}>
          <boxGeometry args={[0.1, 0.5, 0.1]} />
          <meshStandardMaterial color={skinTone} />
        </mesh>
      ))}
      {/* Head */}
      <mesh position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color={skinTone} />
      </mesh>
    </group>
  );
}

// ========== DOG ==========
function Dog({ pathCenter, pathRadius, pathRadiusB, speed }: {
  pathCenter: [number, number, number]; pathRadius: number; pathRadiusB: number; speed: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const angleRef = useRef(Math.random() * Math.PI * 2);
  const tailRef = useRef<THREE.Mesh>(null);

  const dogColor = useMemo(() => {
    const colors = ["#8b6914", "#3a2a1a", "#f5deb3", "#666666", "#c0a060"];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    angleRef.current += speed * delta;
    const x = pathCenter[0] + Math.cos(angleRef.current) * pathRadius;
    const z = pathCenter[2] + Math.sin(angleRef.current) * pathRadiusB;
    groupRef.current.position.set(x, 0, z);
    const dx = -Math.sin(angleRef.current) * pathRadius;
    const dz = Math.cos(angleRef.current) * pathRadiusB;
    groupRef.current.rotation.y = Math.atan2(dx, dz);
    // Wag tail
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(angleRef.current * 20) * 0.4;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.25, 0.22, 0.6]} />
        <meshStandardMaterial color={dogColor} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.35, -0.35]}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color={dogColor} />
      </mesh>
      {/* Snout */}
      <mesh position={[0, 0.3, -0.48]}>
        <boxGeometry args={[0.1, 0.08, 0.1]} />
        <meshStandardMaterial color={dogColor} />
      </mesh>
      {/* Ears */}
      {[-0.1, 0.1].map((x, i) => (
        <mesh key={`ear-${i}`} position={[x, 0.47, -0.32]}>
          <boxGeometry args={[0.06, 0.1, 0.04]} />
          <meshStandardMaterial color={dogColor} />
        </mesh>
      ))}
      {/* Legs */}
      {[[-0.1, 0.1, 0.2], [0.1, 0.1, 0.2], [-0.1, 0.1, -0.2], [0.1, 0.1, -0.2]].map((pos, i) => (
        <mesh key={`dleg-${i}`} position={pos as [number, number, number]}>
          <boxGeometry args={[0.06, 0.2, 0.06]} />
          <meshStandardMaterial color={dogColor} />
        </mesh>
      ))}
      {/* Tail */}
      <mesh ref={tailRef} position={[0, 0.4, 0.35]} rotation-x={-0.5}>
        <boxGeometry args={[0.04, 0.04, 0.2]} />
        <meshStandardMaterial color={dogColor} />
      </mesh>
    </group>
  );
}

// ========== SIDEWALK ==========
function Sidewalk() {
  const shape = useMemo(() => {
    const outerDist = TRACK_A + 22;
    const outerDistB = TRACK_B + 18;
    const innerDist = TRACK_A + 20;
    const innerDistB = TRACK_B + 16;
    const segments = 64;
    const s = new THREE.Shape();
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const x = Math.cos(t) * outerDist;
      const z = Math.sin(t) * outerDistB;
      if (i === 0) s.moveTo(x, z); else s.lineTo(x, z);
    }
    const hole = new THREE.Path();
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const x = Math.cos(t) * innerDist;
      const z = Math.sin(t) * innerDistB;
      if (i === 0) hole.moveTo(x, z); else hole.lineTo(x, z);
    }
    s.holes.push(hole);
    return s;
  }, []);

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial color="#ccccbb" />
    </mesh>
  );
}

// ========== STREETLAMP ==========
function StreetLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 5, 6]} />
        <meshStandardMaterial color="#444444" metalness={0.7} />
      </mesh>
      <mesh position={[0, 5.1, 0]}>
        <boxGeometry args={[0.4, 0.15, 0.4]} />
        <meshStandardMaterial color="#555555" metalness={0.5} />
      </mesh>
      <mesh position={[0, 5, 0]}>
        <sphereGeometry args={[0.15, 6, 6]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffeeaa" emissiveIntensity={0.6} />
      </mesh>
      <pointLight position={[0, 4.8, 0]} intensity={1.5} color="#ffeeaa" distance={12} />
    </group>
  );
}

// ========== MAIN NEIGHBORHOOD ==========
export default function Neighborhood() {
  const HOUSE_COLORS = ["#cc9966", "#ddbbaa", "#aabb99", "#bbccdd", "#eeddcc", "#dda0a0", "#a0c0dd"];
  const ROOF_COLORS = ["#883333", "#555555", "#334455", "#664422", "#446633"];
  const SKIN_TONES = ["#f5d6b8", "#d4a574", "#8d5524", "#c68642", "#e0ac69"];
  const SHIRT_COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6", "#ff6b6b", "#1abc9c"];

  const houses = useMemo(() => {
    const h: Array<{
      pos: [number, number, number]; rotY: number;
      color: string; roofColor: string; hasLight: boolean;
    }> = [];
    const houseRing = TRACK_A + 38;
    const houseRingB = TRACK_B + 32;
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2 + 0.15;
      const x = Math.cos(angle) * houseRing;
      const z = Math.sin(angle) * houseRingB;
      h.push({
        pos: [x, 0, z],
        rotY: -angle + Math.PI / 2,
        color: HOUSE_COLORS[i % HOUSE_COLORS.length],
        roofColor: ROOF_COLORS[i % ROOF_COLORS.length],
        hasLight: Math.random() > 0.3,
      });
    }
    return h;
  }, []);

  const stores = useMemo(() => {
    const storeRing = TRACK_A + 42;
    const storeRingB = TRACK_B + 36;
    const storeData = [
      { name: "Dollar Store", wallColor: "#dddd88", signColor: "#228833" },
      { name: "Shoppers Drug Mart", wallColor: "#ccddee", signColor: "#cc2222" },
      { name: "Pizza Place", wallColor: "#eeccaa", signColor: "#dd6622" },
      { name: "Coffee Shop", wallColor: "#aa8866", signColor: "#3a2210" },
    ];
    return storeData.map((s, i) => {
      const angle = (i / storeData.length) * Math.PI * 2 + 0.5;
      return {
        ...s,
        pos: [Math.cos(angle) * storeRing, 0, Math.sin(angle) * storeRingB] as [number, number, number],
        rotY: -angle + Math.PI / 2,
      };
    });
  }, []);

  const trees = useMemo(() => {
    const t: Array<[number, number, number]> = [];
    // Sidewalk trees
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2 + Math.random() * 0.1;
      const dist = TRACK_A + 21 + Math.random() * 2;
      const distB = TRACK_B + 17 + Math.random() * 2;
      t.push([Math.cos(angle) * dist, 0, Math.sin(angle) * distB]);
    }
    // Yard trees
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = TRACK_A + 33 + Math.random() * 8;
      const distB = TRACK_B + 27 + Math.random() * 8;
      t.push([Math.cos(angle) * dist, 0, Math.sin(angle) * distB]);
    }
    return t;
  }, []);

  const lamps = useMemo(() => {
    const l: Array<[number, number, number]> = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const dist = TRACK_A + 19;
      const distB = TRACK_B + 15;
      l.push([Math.cos(angle) * dist, 0, Math.sin(angle) * distB]);
    }
    return l;
  }, []);

  const people = useMemo(() => {
    const p: Array<{
      center: [number, number, number]; radius: number; radiusB: number;
      speed: number; color: string; skin: string;
    }> = [];
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = TRACK_A + 24 + Math.random() * 16;
      const distB = TRACK_B + 20 + Math.random() * 14;
      p.push({
        center: [0, 0, 0],
        radius: dist,
        radiusB: distB,
        speed: 0.15 + Math.random() * 0.25,
        color: SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)],
        skin: SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)],
      });
    }
    return p;
  }, []);

  const dogs = useMemo(() => {
    const d: Array<{ center: [number, number, number]; radius: number; radiusB: number; speed: number }> = [];
    for (let i = 0; i < 5; i++) {
      const dist = TRACK_A + 20 + Math.random() * 20;
      const distB = TRACK_B + 16 + Math.random() * 18;
      d.push({
        center: [0, 0, 0],
        radius: dist,
        radiusB: distB,
        speed: 0.3 + Math.random() * 0.4,
      });
    }
    return d;
  }, []);

  return (
    <group>
      <Sidewalk />
      {trees.map((pos, i) => <Tree key={`nt-${i}`} position={pos} />)}
      {lamps.map((pos, i) => <StreetLamp key={`sl-${i}`} position={pos} />)}
      {houses.map((h, i) => (
        <House key={`house-${i}`} position={h.pos} rotY={h.rotY}
          color={h.color} roofColor={h.roofColor} hasLight={h.hasLight} />
      ))}
      {stores.map((s, i) => (
        <Store key={`store-${i}`} position={s.pos} rotY={s.rotY}
          name={s.name} wallColor={s.wallColor} signColor={s.signColor} />
      ))}
      {people.map((p, i) => (
        <WalkingPerson key={`wp-${i}`} pathCenter={p.center}
          pathRadius={p.radius} pathRadiusB={p.radiusB}
          speed={p.speed} color={p.color} skinTone={p.skin} />
      ))}
      {dogs.map((d, i) => (
        <Dog key={`dog-${i}`} pathCenter={d.center}
          pathRadius={d.radius} pathRadiusB={d.radiusB} speed={d.speed} />
      ))}
    </group>
  );
}
