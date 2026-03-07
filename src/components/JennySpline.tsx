"use client";

import Spline from '@splinetool/react-spline';
import { useRef, useEffect, useState } from 'react';

interface JennySplineProps {
    amplitude: number;
    isActive: boolean;
    isSpeaking: boolean;
    agentName: string | null;
}

interface SplineApp {
    findObjectByName: (name: string) => {
        scale: { set: (x: number, y: number, z: number) => void };
    } | null;
}

export default function JennySpline({ amplitude, isActive, isSpeaking, agentName }: JennySplineProps) {
    const splineRef = useRef<SplineApp | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    function onLoad(splineApp: any) {
        splineRef.current = splineApp as SplineApp;
        setIsLoading(false);
        console.log("[JennySpline] Spline loaded successfully");
    }

    // React to amplitude/speaking changes
    useEffect(() => {
        if (!splineRef.current) return;

        // Find the main core object - Spline URLs often use 'Core', 'Sphere', or 'Neural'
        const obj = splineRef.current.findObjectByName('Core')
            || splineRef.current.findObjectByName('Sphere')
            || splineRef.current.findObjectByName('Neural');

        if (obj) {
            const scale = 1 + amplitude * 1.5; // High sensitivity for "Wow"
            obj.scale.set(scale, scale, scale);

            // material casted locally to avoid lint errors on interfaces
            const objAny = obj as any;
            if (objAny.material && isSpeaking) {
                // Potential for color shifts or emission changes
            }
        }
    }, [amplitude, isSpeaking]);

    return (
        <div className={`relative w-full h-full min-h-[400px] flex items-center justify-center transition-all duration-700 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20 backdrop-blur-sm rounded-full">
                    <div className="w-32 h-32 rounded-full bg-cyan-500/10 animate-pulse blur-2xl" />
                    <div className="absolute w-24 h-24 rounded-full border-t-2 border-cyan-500/40 animate-spin" />
                    <div className="absolute text-[8px] font-black tracking-widest text-cyan-500/60 uppercase mt-24">
                        Initialising Neural Mesh
                    </div>
                </div>
            )}

            <Spline
                scene="https://prod.spline.design/6Wq1Q7YAnWfEL7uH/scene.splinecode"
                onLoad={onLoad}
                style={{ width: '100%', height: '100%' }}
            />

            {/* Conditional Speaking Glow */}
            {isSpeaking && (
                <div className="absolute inset-0 pointer-events-none rounded-full bg-green-500/5 blur-[80px] animate-pulse" />
            )}

            {/* Agent Label Overlay */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-green-500 animate-ping' : 'bg-cyan-500/40'}`} />
                <span className="text-[10px] font-black tracking-[0.2em] text-white/60 uppercase">
                    SYS: {agentName === "Jenny" ? "NEURAL_LINK_JENNY" : "STANDBY"}
                </span>
            </div>
        </div>
    );
}
