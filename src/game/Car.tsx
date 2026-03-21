import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CarState, getTrackPosition, getTrackTangent } from "./useGameState";
import CarDecals from "./CarDecals";

interface CarProps {
  carRef: React.MutableRefObject<CarState>;
}

function SedanBody({ color }: { color: string }) {
  return (
    <>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[2, 0.8, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1, -0.3]}>
        <boxGeometry args={[1.6, 0.6, 2]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} />
      </mesh>
    </>
  );
}

function SportBody({ color }: { color: string }) {
  return (
    <>
      {/* Low wide body */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[2.2, 0.6, 4.5]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Sloped cabin */}
      <mesh position={[0, 0.75, -0.5]} rotation-x={-0.15}>
        <boxGeometry args={[1.6, 0.45, 1.8]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Front wedge */}
      <mesh position={[0, 0.25, -2.1]}>
        <boxGeometry args={[1.8, 0.3, 0.6]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
    </>
  );
}

function TruckBody({ color }: { color: string }) {
  return (
    <>
      {/* Cab */}
      <mesh position={[0, 0.6, -0.8]}>
        <boxGeometry args={[2.4, 1.2, 2.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Cabin top */}
      <mesh position={[0, 1.4, -0.8]}>
        <boxGeometry args={[2, 0.6, 1.8]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.6} />
      </mesh>
      {/* Bed */}
      <mesh position={[0, 0.4, 1]}>
        <boxGeometry args={[2.4, 0.8, 2.4]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.7} />
      </mesh>
      {/* Bed walls */}
      <mesh position={[0, 0.9, 1]}>
        <boxGeometry args={[2.4, 0.2, 2.4]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.7} />
      </mesh>
    </>
  );
}

function FormulaBody({ color }: { color: string }) {
  return (
    <>
      {/* Narrow fuselage */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1, 0.5, 4.5]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Nose cone */}
      <mesh position={[0, 0.25, -2.3]}>
        <boxGeometry args={[0.6, 0.35, 0.8]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Front wing */}
      <mesh position={[0, 0.15, -2.8]}>
        <boxGeometry args={[2.6, 0.06, 0.5]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Side pods */}
      <mesh position={[-0.9, 0.35, 0.3]}>
        <boxGeometry args={[0.8, 0.4, 1.6]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0.9, 0.35, 0.3]}>
        <boxGeometry args={[0.8, 0.4, 1.6]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Rear wing */}
      <mesh position={[0, 0.8, 2.2]}>
        <boxGeometry args={[2, 0.06, 0.4]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Roll hoop */}
      <mesh position={[0, 0.7, -0.2]}>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} />
      </mesh>
    </>
  );
}

export default function Car({ carRef }: CarProps) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    const car = carRef.current;
    const [x, y, z] = getTrackPosition(car.angle, car.lane, car.flyHeight);
    const rot = getTrackTangent(car.angle, car.lane);
    meshRef.current.position.set(x, y, z);
    meshRef.current.rotation.y = rot + Math.PI;
  });

  const car = carRef.current;
  const color = car.color;
  const body = car.bodyStyle || "sedan";
  const wheelRadius = car.hasBigWheels ? 0.6 : 0.4;
  const wheelWidth = car.hasBigWheels ? 0.45 : 0.3;

  const wheelPositions: [number, number, number][] =
    body === "truck"
      ? [[-1.1, 0, 1.5], [1.1, 0, 1.5], [-1.1, 0, -1], [1.1, 0, -1]]
      : body === "formula"
      ? [[-1.2, 0, 1.5], [1.2, 0, 1.5], [-1.2, 0, -1.8], [1.2, 0, -1.8]]
      : [[-1, 0, 1.3], [1, 0, 1.3], [-1, 0, -1.3], [1, 0, -1.3]];

  return (
    <group ref={meshRef}>
      {/* Body */}
      {body === "sedan" && <SedanBody color={color} />}
      {body === "sport" && <SportBody color={color} />}
      {body === "truck" && <TruckBody color={color} />}
      {body === "formula" && <FormulaBody color={color} />}

      {/* Decals */}
      <CarDecals decal={car.decal} decalColor={car.decalColor} bodyStyle={body} />

      {/* Wheels */}
      {wheelPositions.map((pos, i) => (
        <mesh key={i} position={pos} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[wheelRadius, wheelRadius, wheelWidth, 12]} />
          <meshStandardMaterial 
            color={car.wheelDamaged ? "#ff3333" : (car.hasBigWheels ? "#333333" : "#222222")} 
            emissive={car.wheelDamaged ? "#ff0000" : "#000000"}
            emissiveIntensity={car.wheelDamaged ? 0.4 : 0}
          />
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
      {car.hasWings && body !== "formula" && (
        <>
          <mesh position={[-1.6, 0.8, 0.5]} rotation-z={-0.2}>
            <boxGeometry args={[1.5, 0.08, 1.2]} />
            <meshStandardMaterial color="#aaaaaa" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[1.6, 0.8, 0.5]} rotation-z={0.2}>
            <boxGeometry args={[1.5, 0.08, 1.2]} />
            <meshStandardMaterial color="#aaaaaa" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, 1.4, 2]}>
            <boxGeometry args={[2.2, 0.06, 0.6]} />
            <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.4} />
          </mesh>
          {[[-0.8, 1.1, 2], [0.8, 1.1, 2]].map((pos, i) => (
            <mesh key={`spoiler-${i}`} position={pos as [number, number, number]}>
              <boxGeometry args={[0.08, 0.5, 0.08]} />
              <meshStandardMaterial color="#666666" />
            </mesh>
          ))}
        </>
      )}

      {/* Parachute pack */}
      {car.hasParachute && (
        <mesh position={[0, 0.7, 2.3]}>
          <boxGeometry args={[0.6, 0.5, 0.4]} />
          <meshStandardMaterial color="#cc3333" />
        </mesh>
      )}

      {/* Laser turret */}
      {car.hasLaser && (
        <group position={[0, 1.2, -1.5]}>
          {/* Turret base */}
          <mesh>
            <cylinderGeometry args={[0.25, 0.3, 0.3, 8]} />
            <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Barrel */}
          <mesh position={[0, 0.1, -0.4]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.08, 0.08, 0.8, 6]} />
            <meshStandardMaterial color="#ffcc00" metalness={0.9} roughness={0.1} emissive="#ffaa00" emissiveIntensity={0.3} />
          </mesh>
        </group>
      )}

      {/* Laser beam when firing */}
      {car.laserFiring && car.hasLaser && (
        <mesh position={[0, 1.2, -8]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.05, 0.05, 12, 6]} />
          <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={2} transparent opacity={0.8} />
        </mesh>
      )}

      {/* Upgraded engine exhaust glow */}
      {car.hasUpgradedEngine && (
        <mesh position={[0, 0.3, 2.3]}>
          <sphereGeometry args={[0.25, 8, 8]} />
          <meshStandardMaterial color="#8844ff" emissive="#8844ff" emissiveIntensity={0.6} transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}
