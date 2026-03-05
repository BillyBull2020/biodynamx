"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface ROIGraphProps {
    trajectory: number[];
    roiMultiplier: number;
    isVisible: boolean;
}

export default function ROIGraph({ trajectory, roiMultiplier, isVisible }: ROIGraphProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef({ value: 0 });

    useEffect(() => {
        if (!isVisible || !canvasRef.current || trajectory.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d")!;
        const dpr = window.devicePixelRatio || 2;

        const width = 320;
        const height = 200;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        ctx.scale(dpr, dpr);

        const padL = 50, padR = 15, padT = 20, padB = 35;
        const graphW = width - padL - padR;
        const graphH = height - padT - padB;

        const minVal = Math.min(...trajectory) * 0.9;
        const maxVal = Math.max(...trajectory) * 1.1;

        function drawFrame(progress: number) {
            ctx.clearRect(0, 0, width, height);

            // Grid lines
            ctx.strokeStyle = "rgba(255,255,255,0.06)";
            ctx.lineWidth = 1;
            for (let i = 0; i <= 4; i++) {
                const y = padT + (graphH / 4) * i;
                ctx.beginPath();
                ctx.moveTo(padL, y);
                ctx.lineTo(width - padR, y);
                ctx.stroke();
            }

            // Y-axis labels
            ctx.fillStyle = "rgba(255,255,255,0.25)";
            ctx.font = "9px Inter, sans-serif";
            ctx.textAlign = "right";
            for (let i = 0; i <= 4; i++) {
                const val = maxVal - (maxVal - minVal) * (i / 4);
                const y = padT + (graphH / 4) * i;
                ctx.fillText(`$${(val / 1000).toFixed(0)}k`, padL - 8, y + 3);
            }

            // X-axis labels
            ctx.textAlign = "center";
            for (let i = 0; i < trajectory.length; i += 3) {
                const x = padL + (graphW / (trajectory.length - 1)) * i;
                ctx.fillText(`M${i}`, x, height - 8);
            }

            // Draw the trajectory line (animated up to progress)
            const visiblePoints = Math.floor(progress * (trajectory.length - 1)) + 1;

            // Gradient fill under curve
            const gradient = ctx.createLinearGradient(0, padT, 0, padT + graphH);
            gradient.addColorStop(0, "rgba(16,185,129,0.15)");
            gradient.addColorStop(1, "rgba(16,185,129,0)");

            ctx.beginPath();
            ctx.moveTo(padL, padT + graphH);
            for (let i = 0; i < visiblePoints && i < trajectory.length; i++) {
                const x = padL + (graphW / (trajectory.length - 1)) * i;
                const y = padT + graphH - ((trajectory[i] - minVal) / (maxVal - minVal)) * graphH;
                ctx.lineTo(x, y);
            }
            const lastIdx = Math.min(visiblePoints - 1, trajectory.length - 1);
            const lastX = padL + (graphW / (trajectory.length - 1)) * lastIdx;
            ctx.lineTo(lastX, padT + graphH);
            ctx.closePath();
            ctx.fillStyle = gradient;
            ctx.fill();

            // Draw the line itself
            ctx.beginPath();
            ctx.strokeStyle = "#10b981";
            ctx.lineWidth = 2.5;
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            for (let i = 0; i < visiblePoints && i < trajectory.length; i++) {
                const x = padL + (graphW / (trajectory.length - 1)) * i;
                const y = padT + graphH - ((trajectory[i] - minVal) / (maxVal - minVal)) * graphH;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Glow dot at the end
            if (visiblePoints > 0) {
                const endX = padL + (graphW / (trajectory.length - 1)) * lastIdx;
                const endY = padT + graphH - ((trajectory[lastIdx] - minVal) / (maxVal - minVal)) * graphH;

                // Outer glow
                ctx.beginPath();
                ctx.arc(endX, endY, 8, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
                ctx.fill();

                // Inner dot
                ctx.beginPath();
                ctx.arc(endX, endY, 3.5, 0, Math.PI * 2);
                ctx.fillStyle = "#10b981";
                ctx.fill();
            }

            // 2x ROI line
            if (trajectory.length >= 2) {
                const twoXValue = trajectory[0] * 2;
                if (twoXValue <= maxVal && twoXValue >= minVal) {
                    const twoXY = padT + graphH - ((twoXValue - minVal) / (maxVal - minVal)) * graphH;
                    ctx.setLineDash([4, 4]);
                    ctx.strokeStyle = "rgba(234,179,8,0.4)";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(padL, twoXY);
                    ctx.lineTo(width - padR, twoXY);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    ctx.fillStyle = "rgba(234,179,8,0.6)";
                    ctx.font = "bold 9px Inter, sans-serif";
                    ctx.textAlign = "left";
                    ctx.fillText("2x ROI →", padL + 3, twoXY - 5);
                }
            }
        }

        // Animate the graph drawing
        progressRef.current.value = 0;
        gsap.to(progressRef.current, {
            value: 1,
            duration: 3,
            ease: "power2.out",
            delay: 0.5,
            onUpdate: () => drawFrame(progressRef.current.value),
        });

        // Container entrance
        if (containerRef.current) {
            gsap.fromTo(containerRef.current,
                { opacity: 0, y: 20, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out" }
            );
        }
    }, [isVisible, trajectory, roiMultiplier]);

    if (!isVisible || trajectory.length === 0) return null;

    return (
        <div ref={containerRef} className="opacity-0">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-[0.15em] text-emerald-400/60 font-bold">
                    ROI Trajectory
                </span>
                <span className="text-sm font-black text-emerald-400">
                    {roiMultiplier.toFixed(1)}x
                </span>
            </div>
            <canvas
                ref={canvasRef}
                className="w-full rounded-xl"
                style={{
                    background: "rgba(0,0,0,0.2)",
                    border: "1px solid rgba(16,185,129,0.1)",
                }}
            />
        </div>
    );
}
