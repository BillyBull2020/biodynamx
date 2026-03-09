"use client";

import { Suspense, useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ── GLSL fragment shader ──────────────────────────────────────────────────
const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const FRAG = `
uniform float uTime;
uniform float uProgress;
uniform sampler2D uTex1;
uniform sampler2D uTex2;
varying vec2 vUv;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}
float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    float a = hash(i), b = hash(i+vec2(1,0)), c = hash(i+vec2(0,1)), d = hash(i+vec2(1,1));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;
}

void main() {
    vec2 uv = vUv;
    float p = uProgress;

    // Organic animated noise dissolve
    float n = noise(uv * 14.0 + vec2(uTime * 0.35, uTime * 0.2));
    float mixVal = smoothstep(p - 0.38, p + 0.38, n);

    vec4 texA = texture2D(uTex1, uv); // man
    vec4 texB = texture2D(uTex2, uv); // robot

    // Remove near-black (PNG bg artifacts)
    texA.a *= smoothstep(0.04, 0.14, length(texA.rgb));
    texB.a *= smoothstep(0.04, 0.14, length(texB.rgb));

    vec4 col = mix(texA, texB, mixVal);

    // Scan-edge glow transition — gold (human) ↔ cyan (robot)
    float edge = 1.0 - smoothstep(0.0, 0.07, abs(mixVal - 0.5));
    vec3 glow  = mix(vec3(1.0,0.84,0.0), vec3(0.0,0.85,1.0), p);
    col.rgb   += glow * edge * 0.55;

    // Soft vignette
    float vig  = 1.0 - smoothstep(0.3, 0.75, length(uv - 0.5) * 1.5);
    col.rgb   *= (0.65 + 0.35 * vig);

    gl_FragColor = col;
    if (col.a < 0.01) discard;
}`;

// ── Inner scene ─────────────────────────────────────────────────────────────
function MorphScene() {
    const { viewport } = useThree();
    const meshRef = useRef<THREE.Mesh>(null);
    const matRef = useRef<THREE.ShaderMaterial | null>(null);
    const scrollTargetRef = useRef(0);

    const [texMan, texRobot] = useTexture([
        "/assets/hero_man.png",
        "/assets/hero_robot.png",
    ]);

    // Color space relies on THREE's default SRGBColorSpace for textures

    const material = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uProgress: { value: 0 },
            uTex1: { value: texMan },
            uTex2: { value: texRobot },
        },
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
    }), [texMan, texRobot]);

    // Store ref safely
    useEffect(() => {
        matRef.current = material;
    }, [material]);

    const imageAspect = useMemo(() => {
        const img = texMan.image as HTMLImageElement | null;
        return img && img.width ? img.width / img.height : 0.75;
    }, [texMan]);

    const scale = useMemo<[number, number, number]>(() => {
        const h = viewport.height * 0.82;
        const w = h * imageAspect;
        if (w > viewport.width * 0.88) {
            const cw = viewport.width * 0.88;
            return [cw, cw / imageAspect, 1];
        }
        return [w, h, 1];
    }, [viewport, imageAspect]);

    useEffect(() => {
        // Track the scroll to change morph state. Complete morph when user scrolls 400px down.
        const handleScroll = () => {
            let progress = window.scrollY / 400;
            if (progress > 1) progress = 1;
            scrollTargetRef.current = progress;
        };
        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useFrame((state, delta) => {
        const mat = matRef.current;
        if (!mat) return;

        // Smoothly interpolate to scroll target
        mat.uniforms.uProgress.value = THREE.MathUtils.lerp(mat.uniforms.uProgress.value, scrollTargetRef.current, 0.08);
        mat.uniforms.uTime.value += delta;

        // Parallax / subtle 3D hovering
        if (meshRef.current) {
            meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, state.mouse.x * 0.05, 0.04);
            meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, state.mouse.y * -0.05, 0.04);
        }
    });

    return (
        <mesh ref={meshRef} scale={scale} material={material}>
            <planeGeometry args={[1, 1]} />
        </mesh>
    );
}

// ── Public export ─────────────────────────────────────────────────────────
export default function HeroMorph() {
    return (
        <Canvas
            camera={{ position: [0, 0, 5], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
            style={{ width: "100%", height: "100%", display: "block", pointerEvents: "none" }}
            dpr={[1, 2]}
        >
            <Suspense fallback={null}>
                <MorphScene />
            </Suspense>
            <ambientLight intensity={1.5} />
        </Canvas>
    );
}
