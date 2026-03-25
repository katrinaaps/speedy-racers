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
        <cylinderGeometry args={[0.12, 0.18, height, 5]} />
        <meshStandardMaterial color="#5a3a1a" />
      </mesh>
      <mesh position={[0, height + 0.8, 0]}>
        <sphereGeometry args={[crownSize, 6, 5]} />
        <meshStandardMaterial color={crownColor} />
      </mesh>
    </group>
  );
}

// ========== HOUSE ==========
function House({ position, rotY, color, roofColor, hasLight }: {
  position: [number, number, number]; rotY: number;
  color: string; roofColor: string; hasLight: boolean;
}) {
  const windowRef = useRef<THREE.Mesh>(null);
  const flickerRef = useRef(Math.random() * 100);

  useFrame((_, delta) => {
    if (!hasLight || !windowRef.current) return;
    flickerRef.current += delta;
    const on = Math.sin(flickerRef.current * 0.3) > -0.3;
    (windowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = on ? 0.8 : 0;
  });

  return (
    <group position={position} rotation-y={rotY}>
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[4, 3.6, 3.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 3.9, 0]}>
        <coneGeometry args={[3.2, 1.8, 4]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>
      <mesh position={[0, 0.8, 1.76]}>
        <boxGeometry args={[0.7, 1.6, 0.05]} />
        <meshStandardMaterial color="#5a3520" />
      </mesh>
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
      <mesh position={[1.2, 4.5, -0.5]}>
        <boxGeometry args={[0.5, 1.2, 0.5]} />
        <meshStandardMaterial color="#884444" />
      </mesh>
    </group>
  );
}

// ========== STORE ==========
function Store({ position, rotY, wallColor, signColor }: {
  position: [number, number, number]; rotY: number;
  wallColor: string; signColor: string;
}) {
  return (
    <group position={position} rotation-y={rotY}>
      <mesh position={[0, 2.2, 0]}>
        <boxGeometry args={[6, 4.4, 4]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      <mesh position={[0, 4.45, 0]}>
        <boxGeometry args={[6.3, 0.15, 4.3]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      <mesh position={[0, 3.8, 2.02]}>
        <boxGeometry args={[5, 0.8, 0.1]} />
        <meshStandardMaterial color={signColor} />
      </mesh>
      <mesh position={[0, 3.8, 2.08]}>
        <boxGeometry args={[4.2, 0.4, 0.02]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 1.2, 2.02]}>
        <boxGeometry args={[4, 2.2, 0.05]} />
        <meshStandardMaterial color="#aaddee" transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 0.9, 2.04]}>
        <boxGeometry args={[1.2, 1.8, 0.06]} />
        <meshStandardMaterial color="#447799" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// ========== WALKING PERSON ==========
function WalkingPerson({ pathRadius, pathRadiusB, speed, color, skinTone, startAngle }: {
  pathRadius: number; pathRadiusB: number;
  speed: number; color: string; skinTone: string; startAngle: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const angleRef = useRef(startAngle);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    angleRef.current += speed * delta;
    const x = Math.cos(angleRef.current) * pathRadius;
    const z = Math.sin(angleRef.current) * pathRadiusB;
    groupRef.current.position.set(x, 0, z);
    const dx = -Math.sin(angleRef.current) * pathRadius;
    const dz = Math.cos(angleRef.current) * pathRadiusB;
    groupRef.current.rotation.y = Math.atan2(dx, dz);
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.3, 1.4, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.15, 6, 6]} />
        <meshStandardMaterial color={skinTone} />
      </mesh>
    </group>
  );
}

// ========== DOG ==========
function Dog({ pathRadius, pathRadiusB, speed, startAngle }: {
  pathRadius: number; pathRadiusB: number; speed: number; startAngle: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const angleRef = useRef(startAngle);
  const dogColor = useMemo(() => {
    const colors = ["#8b6914", "#3a2a1a", "#f5deb3", "#666666", "#c0a060"];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    angleRef.current += speed * delta;
    const x = Math.cos(angleRef.current) * pathRadius;
    const z = Math.sin(angleRef.current) * pathRadiusB;
    groupRef.current.position.set(x, 0, z);
    const dx = -Math.sin(angleRef.current) * pathRadius;
    const dz = Math.cos(angleRef.current) * pathRadiusB;
    groupRef.current.rotation.y = Math.atan2(dx, dz);
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.25, 0.22, 0.6]} />
        <meshStandardMaterial color={dogColor} />
      </mesh>
      <mesh position={[0, 0.35, -0.35]}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
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
    const segments = 48;
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

// ========== STREETLAMP (no point light — just emissive glow) ==========
function StreetLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 5, 5]} />
        <meshStandardMaterial color="#444444" metalness={0.7} />
      </mesh>
      <mesh position={[0, 5, 0]}>
        <sphereGeometry args={[0.2, 6, 6]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffeeaa" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

// ========== MAIN NEIGHBORHOOD ==========
export default function Neighborhood() {
  const HOUSE_COLORS = ["#cc9966", "#ddbbaa", "#aabb99", "#bbccdd", "#eeddcc", "#dda0a0", "#a0c0dd"];
  const ROOF_COLORS = ["#883333", "#555555", "#334455", "#664422", "#446633"];
  const SKIN_TONES = ["#f5d6b8", "#d4a574", "#8d5524", "#c68642", "#e0ac69"];
  const SHIRT_COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6"];

  const houses = useMemo(() => {
    const h: Array<{
      pos: [number, number, number]; rotY: number;
      color: string; roofColor: string; hasLight: boolean;
    }> = [];
    const houseRing = TRACK_A + 38;
    const houseRingB = TRACK_B + 32;
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + 0.15;
      h.push({
        pos: [Math.cos(angle) * houseRing, 0, Math.sin(angle) * houseRingB],
        rotY: -angle + Math.PI / 2,
        color: HOUSE_COLORS[i % HOUSE_COLORS.length],
        roofColor: ROOF_COLORS[i % ROOF_COLORS.length],
        hasLight: i % 3 === 0,
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
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 + Math.random() * 0.1;
      const dist = TRACK_A + 21 + Math.random() * 2;
      const distB = TRACK_B + 17 + Math.random() * 2;
      t.push([Math.cos(angle) * dist, 0, Math.sin(angle) * distB]);
    }
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = TRACK_A + 33 + Math.random() * 8;
      const distB = TRACK_B + 27 + Math.random() * 8;
      t.push([Math.cos(angle) * dist, 0, Math.sin(angle) * distB]);
    }
    return t;
  }, []);

  const lamps = useMemo(() => {
    const l: Array<[number, number, number]> = [];
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const dist = TRACK_A + 19;
      const distB = TRACK_B + 15;
      l.push([Math.cos(angle) * dist, 0, Math.sin(angle) * distB]);
    }
    return l;
  }, []);

  const people = useMemo(() => {
    const p: Array<{
      radius: number; radiusB: number;
      speed: number; color: string; skin: string; startAngle: number;
    }> = [];
    for (let i = 0; i < 6; i++) {
      p.push({
        radius: TRACK_A + 24 + Math.random() * 16,
        radiusB: TRACK_B + 20 + Math.random() * 14,
        speed: 0.15 + Math.random() * 0.25,
        color: SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)],
        skin: SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)],
        startAngle: Math.random() * Math.PI * 2,
      });
    }
    return p;
  }, []);

  const dogs = useMemo(() => {
    const d: Array<{ radius: number; radiusB: number; speed: number; startAngle: number }> = [];
    for (let i = 0; i < 3; i++) {
      d.push({
        radius: TRACK_A + 20 + Math.random() * 20,
        radiusB: TRACK_B + 16 + Math.random() * 18,
        speed: 0.3 + Math.random() * 0.4,
        startAngle: Math.random() * Math.PI * 2,
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
          wallColor={s.wallColor} signColor={s.signColor} />
      ))}
      {people.map((p, i) => (
        <WalkingPerson key={`wp-${i}`}
          pathRadius={p.radius} pathRadiusB={p.radiusB}
          speed={p.speed} color={p.color} skinTone={p.skin} startAngle={p.startAngle} />
      ))}
      {dogs.map((d, i) => (
        <Dog key={`dog-${i}`}
          pathRadius={d.radius} pathRadiusB={d.radiusB} speed={d.speed} startAngle={d.startAngle} />
      ))}
    </group>
  );
}
