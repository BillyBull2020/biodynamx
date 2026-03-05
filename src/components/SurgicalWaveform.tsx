"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

export type OrbMode = "idle" | "alpha" | "beta" | "merge";

export interface SurgicalWaveformHandle {
    feedAudio: (amplitude: number, pitch: number) => void;
    setMode: (mode: OrbMode) => void;
    triggerMerge: () => Promise<void>;
}

const SurgicalWaveform = forwardRef<SurgicalWaveformHandle, { onClick?: () => void; label?: string; activeAgent?: "Jenny" | "Mark" }>(
    ({ onClick, label, activeAgent = "Jenny" }, ref) => {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const modeRef = useRef<OrbMode>("idle");

        // Audio state
        const audioState = useRef({
            amplitude: 0,
            pitch: 0.5,
        });

        // Target smoothed state
        const smoothState = useRef({
            amplitude: 0
        });

        useImperativeHandle(ref, () => ({
            feedAudio: (amplitude: number, pitch: number) => {
                audioState.current.amplitude = amplitude;
                audioState.current.pitch = pitch;
            },
            setMode: (mode: OrbMode) => {
                modeRef.current = mode;
            },
            triggerMerge: () => {
                return new Promise<void>((resolve) => {
                    modeRef.current = "merge";
                    setTimeout(resolve, 1000);
                });
            }
        }));

        useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            let running = true;
            const width = canvas.width;
            const height = canvas.height;
            const barCount = 15;
            const barWidth = 4;
            const spacing = 4;

            const totalWidth = barCount * barWidth + (barCount - 1) * spacing;
            const startX = (width - totalWidth) / 2;

            function tick() {
                if (!running) return;

                const { amplitude } = audioState.current;
                smoothState.current.amplitude += (amplitude - smoothState.current.amplitude) * 0.2;

                const currentAmp = smoothState.current.amplitude;
                const mode = modeRef.current;
                const time = Date.now() / 1000;

                ctx!.clearRect(0, 0, width, height);

                for (let i = 0; i < barCount; i++) {
                    const x = startX + i * (barWidth + spacing);

                    let noise = 0;
                    if (mode === "alpha" || mode === "beta") {
                        if (activeAgent === "Jenny") {
                            // Jenny: high-frequency, low-amplitude soft sine wave
                            noise = Math.sin(time * 8 + i * 0.5) * (currentAmp * 20 + 2) + Math.cos(time * 4 - i * 0.8) * (currentAmp * 10);
                        } else {
                            // Mark: low-frequency, high-amplitude jagged pulse
                            noise = Math.sin(time * 3 + i * 1.5) * (currentAmp * 60 + 10) + Math.tan(time * 2) * (currentAmp * 15);
                            noise = Math.min(60, Math.max(-60, noise)); // Clamp the tan spike
                        }
                    } else {
                        // Idle flatline
                        noise = 2; // Flat 2px line
                    }

                    // clamp and smooth
                    const baseHeight = activeAgent === "Mark" ? 4 : 2;
                    const barHeight = Math.max(baseHeight, Math.min(activeAgent === "Mark" ? 100 : 80, mode !== "idle" ? 10 + noise + currentAmp * (activeAgent === "Mark" ? 60 : 30) : baseHeight));

                    const y = (height - barHeight) / 2;

                    if (activeAgent === "Jenny") {
                        ctx!.fillStyle = mode === "idle" ? "rgba(255,255,255,0.2)" : "rgba(0, 255, 65, 0.5)";
                        ctx!.shadowColor = mode === "idle" ? "transparent" : "rgba(0, 255, 65, 0.6)";
                        ctx!.shadowBlur = mode === "idle" ? 0 : 15;
                    } else {
                        // Structural, higher opacity for Mark
                        ctx!.fillStyle = mode === "idle" ? "rgba(255,255,255,0.2)" : "rgba(0, 255, 65, 1.0)";
                        ctx!.shadowColor = mode === "idle" ? "transparent" : "rgba(0, 255, 65, 0.8)";
                        ctx!.shadowBlur = mode === "idle" ? 0 : 5;
                    }

                    ctx!.fillRect(x, y, barWidth, barHeight);
                }

                requestAnimationFrame(tick);
            }

            tick();

            return () => { running = false; };
        }, [activeAgent]);

        return (
            <div className="flex flex-col items-center justify-center cursor-pointer gap-6" onClick={onClick}>
                <canvas
                    ref={canvasRef}
                    width={200}
                    height={100}
                    className="block"
                />

                {/* Begin Audit / Initialize button */}
                <button className="bg-[rgba(0,255,65,0.1)] border border-[rgba(0,255,65,0.4)] text-[var(--audit-green)] px-6 py-2 uppercase tracking-widest text-[10px] font-bold font-mono hover:bg-[rgba(0,255,65,0.2)] transition-colors rounded-sm shadow-[0_0_15px_rgba(0,255,65,0.1)]">
                    {label || "Begin Audit"}
                </button>
            </div>
        );
    }
);

SurgicalWaveform.displayName = "SurgicalWaveform";

export default SurgicalWaveform;
