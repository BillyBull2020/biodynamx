"use client";

import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture, shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";

// ── GLSL Morph Shader ──────────────────────────────────────────────────────
// Port of ExperienceV2 from BiodynamX9 — adapted for auto-loop (no scroll)
const MorphMaterial = shaderMaterial(
    {
        uTime: 0,
        uProgress: 0,        // 0 = man, 1 = robot (auto-oscillates)
        uTex1: null,          // Man / Billy
        uTex2: null,          // Robot
        uImageAspect: 1,
    },
    // VERTEX
    `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    // FRAGMENT — noise-based cross-dissolve with scan sweep + cyan glow
    `
    uniform float uTime;
    uniform float uProgress;
    uniform sampler2D uTex1;
    uniform sampler2D uTex2;
    uniform float uImageAspect;
    varying vec2 vUv;

    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    void main() {
        vec2 uv = vUv;
        float p = uProgress; // 0 → 1 → 0 auto loop

        // Slow animated noise for organic dissolve
        float noiseVal = noise(uv * 16.0 + vec2(uTime * 0.4, uTime * 0.25));

        // Mix factor: noise-driven threshold based on progress
        float mixVal = smoothstep(p - 0.35, p + 0.35, noiseVal);

        // Auto-alpha removal for white/black backgrounds  
        vec4 texMan   = texture2D(uTex1, uv);
        vec4 texRobot = texture2D(uTex2, uv);

        // Transparent-ify near-black pixels (PNG cutouts)
        float manAlpha   = smoothstep(0.05, 0.15, length(texMan.rgb));
        float robotAlpha = smoothstep(0.05, 0.15, length(texRobot.rgb));
        texMan.a   *= manAlpha;
        texRobot.a *= robotAlpha;

        vec4 color = mix(texMan, texRobot, mixVal);

        // Cyan scan-line glow at transition edge
        float edgeGlow = 1.0 - smoothstep(0.0, 0.08, abs(mixVal - 0.5));
        // Gold tint when morphing toward man, cyan toward robot
        vec3 glowTint = mix(
            vec3(1.0, 0.84, 0.0),   // gold — human
            vec3(0.0, 0.85, 1.0),   // cyan — robot
            p
        );
        color.rgb += glowTint * edgeGlow * 0.6;

        // Subtle vignette on the edges
        float vignette = 1.0 - smoothstep(0.35, 0.75, length(uv - 0.5) * 1.4);
        color.rgb *= (0.7 + 0.3 * vignette);

        gl_FragColor = color;
        if (color.a < 0.01) discard;
    }
    `
);

extend({ MorphMaterial });

declare global {
    namespace JSX {
        interface IntrinsicElements {
            morphMaterial: {
                ref?: React.Ref<THREE.ShaderMaterial>;
                uTex1?: THREE.Texture;
                uTex2?: THREE.Texture;
                uTime?: number;
                uProgress?: number;
                uImageAspect?: number;
                transparent?: boolean;
                depthWrite?: boolean;
                key?: string;
            };
        }
    }
}

// ── Inner R3F Scene ────────────────────────────────────────────────────────
function MorphScene() {
    const matRef = useRef<THREE.ShaderMaterial>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const { viewport } = useThree();
    const cycleRef = useRef(0); // internal time driver for progress

    const [texMan, texRobot] = useTexture([
        "/assets/hero_man.png",
        "/assets/hero_robot.png",
    ]);

    texMan.colorSpace = THREE.SRGBColorSpace;
    texRobot.colorSpace = THREE.SRGBColorSpace;
    texMan.center.set(0.5, 0.5);
    texRobot.center.set(0.5, 0.5);

    const imageAspect = texMan.image
        ? texMan.image.width / texMan.image.height
        : 0.75;

    const scale = useMemo<[number, number, number]>(() => {
        // Contain within viewport — fill ~85% of height
        const targetH = viewport.height * 0.85;
        const targetW = targetH * imageAspect;
        if (targetW > viewport.width * 0.88) {
            const w = viewport.width * 0.88;
            return [w, w / imageAspect, 1];
        }
        return [targetW, targetH, 1];
    }, [viewport, imageAspect]);

    useFrame((state, delta) => {
        if (!matRef.current) return;

        // Auto-oscillating 0→1→0 over ~12 seconds total cycle
        cycleRef.current += delta * 0.08; // full cycle = ~12.5s
        const rawSin = Math.sin(cycleRef.current * Math.PI * 2);
        // Map sin [-1,1] → [0,1] with smooth ease
        const progress = (rawSin + 1) * 0.5;

        matRef.current.uniforms.uTime.value += delta;
        matRef.current.uniforms.uProgress.value = progress;
        matRef.current.uniforms.uImageAspect.value = imageAspect;

        // Mouse parallax tilt
        if (meshRef.current) {
            meshRef.current.rotation.y = THREE.MathUtils.lerp(
                meshRef.current.rotation.y, state.mouse.x * 0.04, 0.04
            );
            meshRef.current.rotation.x = THREE.MathUtils.lerp(
                meshRef.current.rotation.x, state.mouse.y * -0.03, 0.04
            );
        }
    });

    return (
        <mesh ref={meshRef} scale={scale}>
            <planeGeometry args={[1, 1]} />
            <morphMaterial
                ref={matRef}
                key={(MorphMaterial as unknown as { key: string }).key}
                uTex1={texMan}
                uTex2={texRobot}
                transparent={true}
                depthWrite={false}
            />
        </mesh>
    );
}

// ── Public Component — drop-in canvas ─────────────────────────────────────
export default function HeroMorph() {
    return (
        <Canvas
            camera={{ position: [0, 0, 5], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
            style={{ width: "100%", height: "100%", display: "block" }}
            dpr={[1, 2]}
        >
            <Suspense fallback={null}>
                <MorphScene />
            </Suspense>
            <ambientLight intensity={1.5} />
        </Canvas>
    );
}
