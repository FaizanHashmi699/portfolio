"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * The hero's 3D layer: a dune field rendered as a point cloud.
 *
 * Chosen over a model-based scene for three reasons. It carries no asset download, the
 * whole thing is one BufferGeometry with a shader so the draw cost is trivial on a phone,
 * and displacement happens on the GPU — the CPU does nothing per frame beyond advancing a
 * single uniform. On brand, too: dunes rather than yet another rotating glass skyscraper.
 */

const GRID = 132;
const SPREAD = 26;

const vertexShader = /* glsl */ `
  uniform float uTime;
  varying float vHeight;

  void main() {
    vec3 pos = position;

    // Two interfering sine waves plus a slow swell reads as wind-shaped sand
    // rather than as an obvious sine grid.
    float wave =
      sin(pos.x * 0.28 + uTime * 0.34) * 0.85 +
      cos(pos.z * 0.21 - uTime * 0.22) * 0.65 +
      sin((pos.x + pos.z) * 0.11 + uTime * 0.14) * 0.5;

    pos.y = wave;
    vHeight = wave;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    // Perspective-correct point size, clamped so nothing turns into a blob up close.
    gl_PointSize = clamp(150.0 / -mv.z, 1.0, 4.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uLow;
  uniform vec3 uHigh;
  uniform float uOpacity;
  varying float vHeight;

  void main() {
    // Round the points off; square particles look like dead pixels.
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = dot(c, c);
    if (d > 0.25) discard;

    float t = smoothstep(-1.6, 1.6, vHeight);
    vec3 color = mix(uLow, uHigh, t);
    float edge = 1.0 - smoothstep(0.16, 0.25, d);
    gl_FragColor = vec4(color, edge * uOpacity * (0.35 + t * 0.65));
  }
`;

function Dunes() {
  const material = useRef<THREE.ShaderMaterial>(null);

  const positions = useMemo(() => {
    const array = new Float32Array(GRID * GRID * 3);
    let i = 0;
    for (let x = 0; x < GRID; x++) {
      for (let z = 0; z < GRID; z++) {
        array[i++] = (x / (GRID - 1) - 0.5) * SPREAD;
        array[i++] = 0;
        array[i++] = (z / (GRID - 1) - 0.5) * SPREAD;
      }
    }
    return array;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      // ink-400 and sand-400, matching the CSS palette so the scene and the page agree.
      uLow: { value: new THREE.Color("#4a7fd4") },
      uHigh: { value: new THREE.Color("#e0b062") },
      uOpacity: { value: 0.9 },
    }),
    [],
  );

  useFrame((_, delta) => {
    if (material.current) {
      material.current.uniforms.uTime.value += delta;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function DuneField() {
  return (
    <Canvas
      // Cap the pixel ratio: retina phones will happily render 3x and melt the battery
      // for a difference nobody can see on a background texture.
      dpr={[1, 1.75]}
      camera={{ position: [0, 3.4, 9.5], fov: 48 }}
      gl={{ antialias: false, powerPreference: "low-power" }}
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    >
      <group rotation={[0, Math.PI / 7, 0]}>
        <Dunes />
      </group>
    </Canvas>
  );
}
