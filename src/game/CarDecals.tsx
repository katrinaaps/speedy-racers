import * as THREE from "three";

interface CarDecalsProps {
  decal: string | null;
  decalColor: string;
  bodyStyle: string;
}

function FlameDecals({ color }: { color: string }) {
  // Flame shapes on both sides of the car
  return (
    <>
      {/* Left side flames */}
      {[0, 0.4, 0.8].map((z, i) => (
        <mesh key={`fl-${i}`} position={[-1.05, 0.5, -0.8 + z]} rotation-y={Math.PI / 2}>
          <coneGeometry args={[0.25 - i * 0.05, 0.5 - i * 0.1, 4]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
        </mesh>
      ))}
      {/* Right side flames */}
      {[0, 0.4, 0.8].map((z, i) => (
        <mesh key={`fr-${i}`} position={[1.05, 0.5, -0.8 + z]} rotation-y={-Math.PI / 2}>
          <coneGeometry args={[0.25 - i * 0.05, 0.5 - i * 0.1, 4]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
        </mesh>
      ))}
    </>
  );
}

function RacingStripes({ color }: { color: string }) {
  return (
    <>
      {/* Two parallel stripes running along the top */}
      <mesh position={[-0.3, 0.85, 0]}>
        <boxGeometry args={[0.15, 0.02, 3.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.3, 0.85, 0]}>
        <boxGeometry args={[0.15, 0.02, 3.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </>
  );
}

function StarDecals({ color }: { color: string }) {
  // Stars on the sides and hood
  const positions: [number, number, number][] = [
    [-1.05, 0.6, 0], [1.05, 0.6, 0],
    [-1.05, 0.6, -0.8], [1.05, 0.6, -0.8],
    [0, 0.85, -1.2],
  ];
  return (
    <>
      {positions.map((pos, i) => (
        <mesh key={`star-${i}`} position={pos} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.18, 5]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

function LightningDecals({ color }: { color: string }) {
  // Lightning bolt shapes on each side
  return (
    <>
      {[-1.05, 1.05].map((x, i) => (
        <group key={`bolt-${i}`} position={[x, 0.55, -0.3]} rotation-y={x < 0 ? Math.PI / 2 : -Math.PI / 2}>
          <mesh position={[0, 0.15, 0]} rotation-z={0.3}>
            <boxGeometry args={[0.08, 0.4, 0.02]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, -0.1, 0]} rotation-z={-0.3}>
            <boxGeometry args={[0.08, 0.4, 0.02]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function FlagDecals({ color }: { color: string }) {
  // Flag pattern on the hood
  return (
    <group position={[0, 0.86, -1]}>
      <mesh>
        <boxGeometry args={[0.8, 0.02, 0.6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Horizontal stripes */}
      <mesh position={[0, 0.005, -0.15]}>
        <boxGeometry args={[0.8, 0.02, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.005, 0.15]}>
        <boxGeometry args={[0.8, 0.02, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function CheckerDecals({ color }: { color: string }) {
  // Checkered pattern on the hood
  const tiles: JSX.Element[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const isColored = (row + col) % 2 === 0;
      tiles.push(
        <mesh key={`ck-${row}-${col}`} position={[-0.3 + col * 0.2, 0.86, -1.3 + row * 0.2]}>
          <boxGeometry args={[0.18, 0.02, 0.18]} />
          <meshStandardMaterial color={isColored ? color : "#222222"} />
        </mesh>
      );
    }
  }
  return <>{tiles}</>;
}

export default function CarDecals({ decal, decalColor, bodyStyle }: CarDecalsProps) {
  if (!decal) return null;

  switch (decal) {
    case "flames": return <FlameDecals color={decalColor} />;
    case "racing_stripes": return <RacingStripes color={decalColor} />;
    case "stars": return <StarDecals color={decalColor} />;
    case "lightning": return <LightningDecals color={decalColor} />;
    case "flag": return <FlagDecals color={decalColor} />;
    case "checker": return <CheckerDecals color={decalColor} />;
    default: return null;
  }
}
