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
    const [x, y, z] = getTrackPosition(car.angle, car.lane, car.flyHeight);
    const rot = getTrackTangent(car.angle, car.lane);
    meshRef.current.position.set(x, y, z);
    meshRef.current.rotation.y = rot;
  });

  const car = carRef.current;
  const color = car.color;
  const wheelRadius = car.hasBigWheels ? 0.6 : 0.4;
  const wheelWidth = car.hasBigWheels ? 0.45 : 0.3;

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
          <cylinderGeometry args={[wheelRadius, wheelRadius, wheelWidth, 12]} />
          <meshStandardMaterial color={car.hasBigWheels ? "#333333" : "#222222"} />
        </mesh>
      ))}
      {/* Booster rockets */}
      {car.hasRockets && (
        <>
          {[[-0.7, 0.4, 2.2], [0.7, 0.4, 2.2]].map((pos, i) => (
            <group key={`rocket-${i}`} position={pos as [number, number, number]}>
              <mesh>
                <cylinderGeometry args={[0.2, 0.15, 0.8, 8]} />
                <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.2} />
              </mesh>
              <mesh position={[0, -0.5, 0]}>
                <coneGeometry args={[0.18, 0.3, 8]} />
                <meshStandardMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={0.5} />
              </mesh>
            </group>
          ))}
        </>
      )}
      {/* Wings */}
      {car.hasWings && (
        <>
          {/* Left wing */}
          <mesh position={[-1.6, 0.8, 0.5]} rotation-z={-0.2}>
            <boxGeometry args={[1.5, 0.08, 1.2]} />
            <meshStandardMaterial color="#aaaaaa" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Right wing */}
          <mesh position={[1.6, 0.8, 0.5]} rotation-z={0.2}>
            <boxGeometry args={[1.5, 0.08, 1.2]} />
            <meshStandardMaterial color="#aaaaaa" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Rear spoiler/wing */}
          <mesh position={[0, 1.4, 2]}>
            <boxGeometry args={[2.2, 0.06, 0.6]} />
            <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.4} />
          </mesh>
          {/* Spoiler supports */}
          {[[-0.8, 1.1, 2], [0.8, 1.1, 2]].map((pos, i) => (
            <mesh key={`spoiler-${i}`} position={pos as [number, number, number]}>
              <boxGeometry args={[0.08, 0.5, 0.08]} />
              <meshStandardMaterial color="#666666" />
            </mesh>
          ))}
        </>
      )}
      {/* Parachute pack (on the back) */}
      {car.hasParachute && (
        <mesh position={[0, 0.7, 2.3]}>
          <boxGeometry args={[0.6, 0.5, 0.4]} />
          <meshStandardMaterial color="#cc3333" />
        </mesh>
      )}
    </group>
  );
}
