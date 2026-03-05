import React from "react";

interface AuditGridProps {
    findings: { id: number; text: string; severity: "critical" | "high" | "medium" | "low" }[];
    targetUrl: string;
}

export default function AuditGrid({ findings, targetUrl }: AuditGridProps) {
    const getPulseColor = (severity: string) => {
        switch (severity) {
            case "critical": return "rgba(239, 68, 68, 0.4)"; // Red
            case "high": return "rgba(249, 115, 22, 0.4)";   // Orange
            case "medium": return "rgba(251, 191, 36, 0.4)";  // Yellow
            default: return "var(--audit-green-glow)";        // Green
        }
    };

    const getBorderColor = (severity: string) => {
        switch (severity) {
            case "critical": return "rgba(239, 68, 68, 0.6)";
            case "high": return "rgba(249, 115, 22, 0.6)";
            case "medium": return "rgba(251, 191, 36, 0.6)";
            default: return "rgba(0, 255, 65, 0.6)";
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full h-full p-4">
            <div className="bento-grid-item p-4 border-l-2 border-l-[var(--audit-green)]">
                <h2 className="text-[10px] uppercase font-bold tracking-widest text-[var(--audit-green)] mb-1">
                    Target Locked
                </h2>
                <div className="font-mono text-xs text-white/80 truncate">
                    {targetUrl || "Awaiting Input..."}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3" style={{ scrollbarWidth: 'thin' }}>
                {findings.map((f, i) => (
                    <div
                        key={f.id}
                        className="bento-grid-item p-4"
                        style={{
                            animation: i === findings.length - 1 ? 'listening-pulse 2s infinite' : 'none',
                            borderColor: i === findings.length - 1 ? getBorderColor(f.severity) : undefined,
                            boxShadow: i === findings.length - 1 ? `0 0 15px ${getPulseColor(f.severity)}` : undefined,
                        }}
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                                style={{ backgroundColor: getBorderColor(f.severity) }}
                            />
                            <p className="font-mono text-[11px] leading-relaxed text-white/70">
                                {f.text}
                            </p>
                        </div>
                    </div>
                ))}

                {findings.length === 0 && (
                    <div className="h-40 flex items-center justify-center opacity-30">
                        <span className="font-mono text-[10px] tracking-widest uppercase">Grid Standby</span>
                    </div>
                )
                }
            </div >
        </div >
    );
}
