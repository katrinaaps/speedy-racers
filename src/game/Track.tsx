import { useMemo } from "react";
import * as THREE from "three";
import { TRACK_A, TRACK_B, LANE_WIDTH } from "./useGameState";

export default function Track() {
  const trackShape = useMemo(() => {
    const outerA = TRACK_A + LANE_WIDTH * 2;
    const outerB = TRACK_B + LANE_WIDTH * 2;
    const innerA = TRACK_A - LANE_WIDTH * 2;
    const innerB = TRACK_B - LANE_WIDTH * 2;

    const segments = 128;
    const shape = new THREE.Shape();

    // Outer edge
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const x = Math.cos(t) * outerA;
      const z = Math.sin(t) * outerB;
      if (i === 0) shape.moveTo(x, z);
      else shape.lineTo(x, z);
    }

    // Inner edge (hole)
    const hole = new THREE.Path();
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const x = Math.cos(t) * innerA;
      const z = Math.sin(t) * innerB;
      if (i === 0) hole.moveTo(x, z);
      else hole.lineTo(x, z);
    }
    shape.holes.push(hole);

    return shape;
  }, []);

  // Start/finish line position
  const startX = TRACK_A;
  const startZ = 0;

  return (
    <group>
      {/* Ground */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.1, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#2d5a1e" />
      </mesh>

      {/* Track surface */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
        <shapeGeometry args={[trackShape]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Start/finish line */}
      <mesh rotation-x={-Math.PI / 2} position={[startX, 0.01, startZ]}>
        <planeGeometry args={[1, LANE_WIDTH * 4]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Checkerboard pattern on start line */}
      {[...Array(8)].map((_, i) => (
        <mesh
          key={i}
          rotation-x={-Math.PI / 2}
          position={[
            startX + (i % 2 === 0 ? 0.25 : -0.25),
            0.02,
            startZ - LANE_WIDTH * 2 + (i + 0.5) * LANE_WIDTH,
          ]}
        >
          <planeGeometry args={[0.5, LANE_WIDTH / 2]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#000000" : "#ffffff"} />
        </mesh>
      ))}
    </group>
  );
}
