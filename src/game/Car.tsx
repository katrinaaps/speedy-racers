import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CarState, getTrackPosition, getTrackTangent } from "./useGameState";

interface CarProps {
  carRef: React.MutableRefObject<CarState>;
}

export default function Car({ carRef }: CarProps) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    const car = carRef.current;
    const [x, y, z] = getTrackPosition(car.angle, car.lane);
    const rot = getTrackTangent(car.angle, car.lane);
    meshRef.current.position.set(x, y, z);
    meshRef.current.rotation.y = rot;
  });

  const color = carRef.current.color;

  return (
    <group ref={meshRef}>
      {/* Car body */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[2, 0.8, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 1, -0.3]}>
        <boxGeometry args={[1.6, 0.6, 2]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Wheels */}
      {[[-1, 0, 1.3], [1, 0, 1.3], [-1, 0, -1.3], [1, 0, -1.3]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 8]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
      ))}
    </group>
  );
}
