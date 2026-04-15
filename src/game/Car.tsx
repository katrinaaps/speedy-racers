import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CarState, getTrackPosition, getTrackTangent } from "./useGameState";
import CarDecals from "./CarDecals";
import type { WheelType } from "./carUpgrades";

interface CarProps {
  carRef: React.MutableRefObject<CarState>;
}

function SedanBody({ color }: { color: string }) {
  return (
    <>
      {/* Main body - lower */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[2, 0.6, 4.2]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} />
      </mesh>
      {/* Body contour - slightly narrower top */}
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[1.9, 0.1, 4]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.95, -0.1]}>
        <boxGeometry args={[1.5, 0.5, 2]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 0.95, -1.15]} rotation-x={0.3}>
        <boxGeometry args={[1.4, 0.45, 0.05]} />
        <meshStandardMaterial color="#1a2a3a" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* Rear windshield */}
      <mesh position={[0, 0.95, 0.85]} rotation-x={-0.3}>
        <boxGeometry args={[1.4, 0.45, 0.05]} />
        <meshStandardMaterial color="#1a2a3a" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* Side windows */}
      {[-0.78, 0.78].map((x, i) => (
        <mesh key={`sw-${i}`} position={[x, 0.95, -0.1]}>
          <boxGeometry args={[0.05, 0.4, 1.8]} />
          <meshStandardMaterial color="#1a2a3a" metalness={0.9} roughness={0.1} transparent opacity={0.6} />
        </mesh>
      ))}
      {/* Headlights */}
      {[-0.7, 0.7].map((x, i) => (
        <mesh key={`hl-${i}`} position={[x, 0.4, -2.12]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#ffffcc" emissive="#ffffaa" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {/* Taillights */}
      {[-0.7, 0.7].map((x, i) => (
        <mesh key={`tl-${i}`} position={[x, 0.4, 2.12]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={0.4} />
        </mesh>
      ))}
      {/* Front bumper */}
      <mesh position={[0, 0.2, -2.15]}>
        <boxGeometry args={[1.8, 0.25, 0.1]} />
        <meshStandardMaterial color="#222222" metalness={0.3} roughness={0.6} />
      </mesh>
      {/* Rear bumper */}
      <mesh position={[0, 0.2, 2.15]}>
        <boxGeometry args={[1.8, 0.25, 0.1]} />
        <meshStandardMaterial color="#222222" metalness={0.3} roughness={0.6} />
      </mesh>
      {/* Grille */}
      <mesh position={[0, 0.35, -2.12]}>
        <boxGeometry args={[1.2, 0.2, 0.05]} />
        <meshStandardMaterial color="#111111" metalness={0.6} roughness={0.3} />
      </mesh>
    </>
  );
}

function SportBody({ color }: { color: string }) {
  return (
    <>
      {/* Low wide body */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[2.2, 0.5, 4.5]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Body flare */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[2.1, 0.1, 4.3]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Sloped cabin */}
      <mesh position={[0, 0.7, -0.3]} rotation-x={-0.1}>
        <boxGeometry args={[1.5, 0.35, 1.8]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.15} />
      </mesh>
      {/* Windshield - raked */}
      <mesh position={[0, 0.7, -1.3]} rotation-x={0.5}>
        <boxGeometry args={[1.4, 0.35, 0.05]} />
        <meshStandardMaterial color="#0a1520" metalness={0.95} roughness={0.05} transparent opacity={0.8} />
      </mesh>
      {/* Rear window */}
      <mesh position={[0, 0.7, 0.55]} rotation-x={-0.4}>
        <boxGeometry args={[1.3, 0.3, 0.05]} />
        <meshStandardMaterial color="#0a1520" metalness={0.95} roughness={0.05} transparent opacity={0.7} />
      </mesh>
      {/* Front wedge */}
      <mesh position={[0, 0.2, -2.2]}>
        <boxGeometry args={[1.8, 0.25, 0.6]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Headlights */}
      {[-0.7, 0.7].map((x, i) => (
        <mesh key={`hl-${i}`} position={[x, 0.3, -2.28]}>
          <boxGeometry args={[0.4, 0.1, 0.05]} />
          <meshStandardMaterial color="#ccddff" emissive="#aaccff" emissiveIntensity={0.6} />
        </mesh>
      ))}
      {/* Taillights - strip */}
      <mesh position={[0, 0.35, 2.28]}>
        <boxGeometry args={[1.8, 0.08, 0.05]} />
        <meshStandardMaterial color="#ff1111" emissive="#ff0000" emissiveIntensity={0.5} />
      </mesh>
      {/* Rear diffuser */}
      <mesh position={[0, 0.08, 2.2]}>
        <boxGeometry args={[1.6, 0.12, 0.3]} />
        <meshStandardMaterial color="#111111" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Side air intakes */}
      {[-1.12, 1.12].map((x, i) => (
        <mesh key={`si-${i}`} position={[x, 0.3, 0.5]}>
          <boxGeometry args={[0.05, 0.2, 0.8]} />
          <meshStandardMaterial color="#111111" metalness={0.4} roughness={0.5} />
        </mesh>
      ))}
    </>
  );
}

function TruckBody({ color }: { color: string }) {
  return (
    <>
      {/* Cab body */}
      <mesh position={[0, 0.5, -0.8]}>
        <boxGeometry args={[2.4, 1, 2.2]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.6} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 1.2, -0.8]}>
        <boxGeometry args={[2.2, 0.6, 1.9]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.6} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 1.2, -1.78]} rotation-x={0.15}>
        <boxGeometry args={[1.9, 0.55, 0.05]} />
        <meshStandardMaterial color="#1a2a3a" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* Side windows */}
      {[-1.12, 1.12].map((x, i) => (
        <mesh key={`sw-${i}`} position={[x, 1.2, -0.8]}>
          <boxGeometry args={[0.05, 0.45, 1.2]} />
          <meshStandardMaterial color="#1a2a3a" metalness={0.9} roughness={0.1} transparent opacity={0.6} />
        </mesh>
      ))}
      {/* Bed */}
      <mesh position={[0, 0.35, 1]}>
        <boxGeometry args={[2.4, 0.7, 2.4]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.7} />
      </mesh>
      {/* Bed walls */}
      {[[-1.18, 0.85, 1], [1.18, 0.85, 1], [0, 0.85, 2.18]].map((pos, i) => (
        <mesh key={`bw-${i}`} position={pos as [number, number, number]}>
          <boxGeometry args={[i < 2 ? 0.08 : 2.4, 0.35, i < 2 ? 2.4 : 0.08]} />
          <meshStandardMaterial color={color} metalness={0.1} roughness={0.7} />
        </mesh>
      ))}
      {/* Headlights */}
      {[-0.85, 0.85].map((x, i) => (
        <mesh key={`hl-${i}`} position={[x, 0.6, -1.92]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#ffffcc" emissive="#ffffaa" emissiveIntensity={0.4} />
        </mesh>
      ))}
      {/* Taillights */}
      {[-0.85, 0.85].map((x, i) => (
        <mesh key={`tl-${i}`} position={[x, 0.5, 2.22]}>
          <boxGeometry args={[0.3, 0.2, 0.05]} />
          <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={0.3} />
        </mesh>
      ))}
      {/* Grille */}
      <mesh position={[0, 0.5, -1.92]}>
        <boxGeometry args={[1.6, 0.4, 0.05]} />
        <meshStandardMaterial color="#cccccc" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Bull bar */}
      <mesh position={[0, 0.3, -2]}>
        <boxGeometry args={[2.2, 0.1, 0.1]} />
        <meshStandardMaterial color="#888888" metalness={0.6} roughness={0.3} />
      </mesh>
    </>
  );
}

function FormulaBody({ color }: { color: string }) {
  return (
    <>
      {/* Narrow fuselage */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1, 0.45, 4.5]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.15} />
      </mesh>
      {/* Nose cone */}
      <mesh position={[0, 0.25, -2.3]}>
        <boxGeometry args={[0.5, 0.3, 0.8]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.15} />
      </mesh>
      {/* Front wing */}
      <mesh position={[0, 0.15, -2.8]}>
        <boxGeometry args={[2.6, 0.05, 0.5]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Front wing endplates */}
      {[-1.32, 1.32].map((x, i) => (
        <mesh key={`fwep-${i}`} position={[x, 0.15, -2.8]}>
          <boxGeometry args={[0.04, 0.15, 0.5]} />
          <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      {/* Side pods */}
      {[-0.9, 0.9].map((x, i) => (
        <mesh key={`sp-${i}`} position={[x, 0.32, 0.3]}>
          <boxGeometry args={[0.7, 0.35, 1.6]} />
          <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} />
        </mesh>
      ))}
      {/* Air intake */}
      <mesh position={[0, 0.65, -0.3]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#222222" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Roll hoop */}
      <mesh position={[0, 0.7, -0.2]}>
        <boxGeometry args={[0.15, 0.35, 0.15]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Rear wing */}
      <mesh position={[0, 0.8, 2.2]}>
        <boxGeometry args={[2, 0.05, 0.35]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Rear wing endplates */}
      {[-1, 1].map((x, i) => (
        <mesh key={`rwep-${i}`} position={[x, 0.7, 2.2]}>
          <boxGeometry args={[0.04, 0.25, 0.4]} />
          <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} />
        </mesh>
      ))}
      {/* DRS flap */}
      <mesh position={[0, 0.9, 2.15]}>
        <boxGeometry args={[1.8, 0.03, 0.2]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Helmet */}
      <mesh position={[0, 0.6, -0.5]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Helmet visor */}
      <mesh position={[0, 0.6, -0.68]}>
        <boxGeometry args={[0.25, 0.08, 0.02]} />
        <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.1} />
      </mesh>
    </>
  );
}

function getWheelSize(wheelType: WheelType): { radius: number; width: number } {
  switch (wheelType) {
    case "big": return { radius: 0.55, width: 0.4 };
    case "bike": return { radius: 0.42, width: 0.12 };
    case "off-road": return { radius: 0.5, width: 0.45 };
    case "slick": return { radius: 0.36, width: 0.32 };
    case "spiked": return { radius: 0.42, width: 0.3 };
    case "monster": return { radius: 0.75, width: 0.55 };
    default: return { radius: 0.38, width: 0.28 };
  }
}

function Wheel({ position, wheelType, damaged }: {
  position: [number, number, number];
  wheelType: WheelType;
  damaged: boolean;
}) {
  const { radius, width } = getWheelSize(wheelType);
  const dmgColor = damaged ? "#ff3333" : undefined;
  const dmgEmissive = damaged ? "#ff0000" : "#000000";
  const dmgIntensity = damaged ? 0.4 : 0;

  return (
    <group position={position}>
      {/* Normal wheels */}
      {wheelType === "normal" && (
        <>
          <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[radius, radius, width, 16]} />
            <meshStandardMaterial color={dmgColor || "#1a1a1a"} emissive={dmgEmissive} emissiveIntensity={dmgIntensity} roughness={0.8} />
          </mesh>
          <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[radius * 0.55, radius * 0.55, width + 0.02, 12]} />
            <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.2} />
          </mesh>
        </>
      )}

      {/* Big wheels - chunky with chrome rims */}
      {wheelType === "big" && (
        <>
          <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[radius, radius, width, 16]} />
            <meshStandardMaterial color={dmgColor || "#222222"} emissive={dmgEmissive} emissiveIntensity={dmgIntensity} roughness={0.7} />
          </mesh>
          <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[radius * 0.6, radius * 0.6, width + 0.02, 12]} />
            <meshStandardMaterial color="#dddddd" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[width / 2 + 0.01, 0, 0]} rotation-z={Math.PI / 2}>
            <circleGeometry args={[radius * 0.35, 8]} />
            <meshStandardMaterial color="#ffcc00" metalness={0.9} roughness={0.1} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}

      {/* Bike wheels - thin with spokes */}
      {wheelType === "bike" && (
        <>
          <mesh rotation-z={Math.PI / 2}>
            <torusGeometry args={[radius * 0.8, radius * 0.15, 8, 20]} />
            <meshStandardMaterial color={dmgColor || "#111111"} emissive={dmgEmissive} emissiveIntensity={dmgIntensity} roughness={0.6} />
          </mesh>
          {/* Spokes */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh key={`spoke-${i}`} rotation-z={Math.PI / 2} rotation-y={(Math.PI / 3) * i}>
              <boxGeometry args={[0.02, radius * 1.5, 0.02]} />
              <meshStandardMaterial color="#999999" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
          <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[radius * 0.1, radius * 0.1, width + 0.01, 8]} />
            <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
          </mesh>
        </>
      )}

      {/* Off-road wheels - knobby tread */}
      {wheelType === "off-road" && (
        <>
          <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[radius, radius, width, 12]} />
            <meshStandardMaterial color={dmgColor || "#2a2a2a"} emissive={dmgEmissive} emissiveIntensity={dmgIntensity} roughness={0.95} />
          </mesh>
          {/* Tread knobs */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const a = (Math.PI * 2 / 8) * i;
            return (
              <mesh key={`knob-${i}`} position={[0, Math.cos(a) * radius * 0.9, Math.sin(a) * radius * 0.9]} rotation-z={Math.PI / 2}>
                <boxGeometry args={[width * 0.9, 0.08, 0.12]} />
                <meshStandardMaterial color={dmgColor || "#3a3a2a"} roughness={1} />
              </mesh>
            );
          })}
          <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[radius * 0.45, radius * 0.45, width + 0.02, 10]} />
            <meshStandardMaterial color="#666655" metalness={0.5} roughness={0.5} />
          </mesh>
        </>
      )}

      {/* Slick wheels - smooth racing tires */}
      {wheelType === "slick" && (
        <>
          <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[radius, radius, width, 24]} />
            <meshStandardMaterial color={dmgColor || "#0a0a0a"} emissive={dmgEmissive} emissiveIntensity={dmgIntensity} roughness={0.1} metalness={0.3} />
          </mesh>
          <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[radius * 0.5, radius * 0.5, width + 0.02, 16]} />
            <meshStandardMaterial color="#cc0000" metalness={0.7} roughness={0.2} />
          </mesh>
        </>
      )}

      {/* Spiked wheels - spikes protruding */}
      {wheelType === "spiked" && (
        <>
          <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[radius, radius, width, 16]} />
            <meshStandardMaterial color={dmgColor || "#1a1a1a"} emissive={dmgEmissive} emissiveIntensity={dmgIntensity} roughness={0.7} />
          </mesh>
          {/* Spikes */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
            const a = (Math.PI * 2 / 10) * i;
            return (
              <mesh key={`spike-${i}`} position={[0, Math.cos(a) * radius, Math.sin(a) * radius]}>
                <coneGeometry args={[0.04, 0.15, 6]} />
                <meshStandardMaterial color="#bbbbbb" metalness={0.9} roughness={0.1} />
              </mesh>
            );
          })}
          <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[radius * 0.5, radius * 0.5, width + 0.02, 12]} />
            <meshStandardMaterial color="#777777" metalness={0.8} roughness={0.2} />
          </mesh>
        </>
      )}

      {/* Monster truck wheels - massive with deep tread */}
      {wheelType === "monster" && (
        <>
          <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[radius, radius, width, 16]} />
            <meshStandardMaterial color={dmgColor || "#1a1a1a"} emissive={dmgEmissive} emissiveIntensity={dmgIntensity} roughness={0.9} />
          </mesh>
          {/* Deep tread pattern */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
            const a = (Math.PI * 2 / 10) * i;
            return (
              <mesh key={`tread-${i}`} position={[0, Math.cos(a) * radius * 0.85, Math.sin(a) * radius * 0.85]} rotation-z={Math.PI / 2}>
                <boxGeometry args={[width * 1.05, 0.12, 0.18]} />
                <meshStandardMaterial color={dmgColor || "#2a2a2a"} roughness={1} />
              </mesh>
            );
          })}
          <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[radius * 0.4, radius * 0.4, width + 0.03, 10]} />
            <meshStandardMaterial color="#ffaa00" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Chrome center cap */}
          <mesh position={[width / 2 + 0.02, 0, 0]} rotation-z={Math.PI / 2}>
            <circleGeometry args={[radius * 0.25, 6]} />
            <meshStandardMaterial color="#eeeeee" metalness={0.95} roughness={0.05} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}
    </group>
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
    // Add spin rotation when spinning out
    meshRef.current.rotation.y = rot + Math.PI + (car.spinRotation || 0);
  });

  const car = carRef.current;
  const color = car.color;
  const body = car.bodyStyle || "sedan";
  const wt = car.wheelType || "normal";
  const { radius: wheelRadius } = getWheelSize(wt);

  const wheelPositions: [number, number, number][] =
    body === "truck"
      ? [[-1.15, 0, 1.5], [1.15, 0, 1.5], [-1.15, 0, -1], [1.15, 0, -1]]
      : body === "formula"
      ? [[-1.2, 0, 1.5], [1.2, 0, 1.5], [-1.2, 0, -1.8], [1.2, 0, -1.8]]
      : body === "sport"
      ? [[-1.05, 0, 1.4], [1.05, 0, 1.4], [-1.05, 0, -1.4], [1.05, 0, -1.4]]
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

      {/* Wheels with rims */}
      {wheelPositions.map((pos, i) => (
        <Wheel
          key={i}
          position={pos}
          wheelType={wt}
          damaged={car.wheelDamaged}
        />
      ))}

      {/* Undercarriage shadow */}
      <mesh position={[0, 0.01, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[2, 4]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.3} />
      </mesh>

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
          <mesh>
            <cylinderGeometry args={[0.25, 0.3, 0.3, 8]} />
            <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.1, -0.4]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.08, 0.08, 0.8, 6]} />
            <meshStandardMaterial color="#ffcc00" metalness={0.9} roughness={0.1} emissive="#ffaa00" emissiveIntensity={0.3} />
          </mesh>
        </group>
      )}

      {/* Laser beam */}
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
