// ═══════════════════════════════════════════════════════════════════════════
// /api/stitch-website — Stitch MCP Website Builder
// ═══════════════════════════════════════════════════════════════════════════
// Clients describe their business, we generate a full website design using
// the Stitch MCP. Supports creation, screen editing, and variant generation.
//
// POST /api/stitch-website/create  — Generate a new website design
// POST /api/stitch-website/edit    — Edit existing screens
// POST /api/stitch-website/variant — Generate design variants
// GET  /api/stitch-website         — Health check + list projects
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { runJulesQAInspection } from "@/lib/jules-api";

const STITCH_BASE = "https://stitch.googleapis.com/v1";

// ── Auth/headers for Stitch API ──────────────────────────────────────────────

function stitchHeaders(): HeadersInit {
    const key = process.env.STITCH_API_KEY || process.env.GOOGLE_AI_API_KEY || "";
    return {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
    };
}

function hasStitchKey(): boolean {
    return !!(process.env.STITCH_API_KEY || process.env.GOOGLE_AI_API_KEY);
}

// ── Prompt builder — converts business info to rich Stitch prompt ─────────────

function buildWebsitePrompt(params: {
    businessName: string;
    industry: string;
    description: string;
    targetAudience?: string;
    primaryCTA?: string;
    colorScheme?: string;
    features?: string[];
}): string {
    const features = params.features?.join(", ") || "contact form, testimonials, services section";
    return `Design a premium, conversion-optimized website for ${params.businessName}.

INDUSTRY: ${params.industry}
BUSINESS: ${params.description}
TARGET AUDIENCE: ${params.targetAudience || "local business customers"}
PRIMARY CTA: ${params.primaryCTA || "Get a Free Consultation"}
COLOR SCHEME: ${params.colorScheme || "professional dark theme with green accents"}
REQUIRED SECTIONS: Hero with headline, ${features}

DESIGN REQUIREMENTS:
- Premium, modern aesthetic that builds immediate trust
- Mobile-first responsive design  
- Clear conversion path from hero to CTA
- Social proof (reviews/testimonials) prominently featured
- Fast-loading, clean layout
- Apply neurobiology of choice principles: loss aversion triggers, scarcity signals, authority markers
- SEO-optimized structure with H1/H2 hierarchy
- Schema.org markup ready

Make this design WOW the business owner at first glance. It should look like a $10,000 custom website.`;
}

// ── GET: Health check ─────────────────────────────────────────────────────────

export async function GET() {
    if (!hasStitchKey()) {
        return NextResponse.json({
            service: "BioDynamX Stitch Website Builder",
            status: "no_api_key",
            message: "Set STITCH_API_KEY or GOOGLE_AI_API_KEY to enable the website builder.",
            capabilities: [
                "create — Generate a full website design from a business description",
                "edit — Modify existing screens",
                "variant — Generate alternative design options",
            ],
            setup: "Add STITCH_API_KEY to .env.local",
        });
    }

    try {
        // List recent projects
        const res = await fetch(`${STITCH_BASE}/projects?filter=view%3Downed`, {
            headers: stitchHeaders(),
        });

        if (!res.ok) {
            return NextResponse.json({
                service: "BioDynamX Stitch Website Builder",
                status: "api_error",
                message: `Stitch API returned ${res.status}: ${await res.text()}`,
            });
        }

        const data = await res.json();
        const projects = (data.projects || []).slice(0, 10).map((p: Record<string, unknown>) => ({
            id: (p.name as string)?.replace("projects/", ""),
            title: p.title || "Untitled Project",
            createTime: p.createTime,
            updateTime: p.updateTime,
        }));

        return NextResponse.json({
            service: "BioDynamX Stitch Website Builder",
            status: "online",
            projects,
            capabilities: ["create", "edit", "variant"],
        });
    } catch (err) {
        return NextResponse.json({
            service: "BioDynamX Stitch Website Builder",
            status: "error",
            message: String(err),
        }, { status: 500 });
    }
}

// ── POST: Handle all website builder actions ──────────────────────────────────

export async function POST(req: NextRequest) {
    const body = await req.json();
    const action = body.action || "create";

    if (!hasStitchKey()) {
        // Graceful fallback — return a simulated response so the portal still works
        console.warn("[Stitch Website] No API key — returning graceful simulation");
        return NextResponse.json({
            success: true,
            simulated: true,
            projectId: "demo-project-001",
            screenId: "demo-screen-001",
            previewUrl: "https://stitch.google.com",
            message: "Stitch API key not configured. Add STITCH_API_KEY to enable live website generation.",
            action,
        });
    }

    try {
        switch (action) {

            // ── CREATE: New website from scratch ──────────────────────────────
            case "create": {
                const {
                    businessName, industry, description,
                    targetAudience, primaryCTA, colorScheme, features,
                    deviceType = "DESKTOP",
                } = body;

                if (!businessName || !industry) {
                    return NextResponse.json({ error: "businessName and industry are required" }, { status: 400 });
                }

                // Step 1: Create a project
                const projectRes = await fetch(`${STITCH_BASE}/projects`, {
                    method: "POST",
                    headers: stitchHeaders(),
                    body: JSON.stringify({ title: `${businessName} — BioDynamX Website` }),
                });

                if (!projectRes.ok) {
                    throw new Error(`Project creation failed: ${await projectRes.text()}`);
                }

                const project = await projectRes.json();
                const projectId = project.name.replace("projects/", "");

                // Step 2: Generate the homepage screen
                const prompt = buildWebsitePrompt({ businessName, industry, description, targetAudience, primaryCTA, colorScheme, features });

                const screenRes = await fetch(`${STITCH_BASE}/projects/${projectId}/screens:generateFromText`, {
                    method: "POST",
                    headers: stitchHeaders(),
                    body: JSON.stringify({
                        prompt,
                        deviceType,
                        modelId: "GEMINI_3_PRO",
                    }),
                });

                if (!screenRes.ok) {
                    throw new Error(`Screen generation failed: ${await screenRes.text()}`);
                }

                const screenOperation = await screenRes.json();
                const screenId = (screenOperation.name || "").split("/screens/")[1]?.replace(":generateFromText", "") || "";

                console.log(`[Stitch Website] ✅ Created project ${projectId} with homepage screen ${screenId}`);

                return NextResponse.json({
                    success: true,
                    projectId,
                    screenId,
                    projectName: project.title,
                    previewUrl: `https://stitch.google.com/project/${projectId}`,
                    message: `Website design for "${businessName}" is generating. This takes 1-2 minutes.`,
                    operation: screenOperation,
                });
            }

            // ── EDIT: Modify existing screens ─────────────────────────────────
            case "edit": {
                const { projectId, screenIds, editPrompt, deviceType = "DESKTOP" } = body;

                if (!projectId || !screenIds?.length || !editPrompt) {
                    return NextResponse.json({ error: "projectId, screenIds, and editPrompt required" }, { status: 400 });
                }

                const editRes = await fetch(`${STITCH_BASE}/projects/${projectId}/screens:edit`, {
                    method: "POST",
                    headers: stitchHeaders(),
                    body: JSON.stringify({
                        prompt: editPrompt,
                        selectedScreenIds: screenIds,
                        deviceType,
                        modelId: "GEMINI_3_FLASH",
                    }),
                });

                if (!editRes.ok) {
                    throw new Error(`Screen edit failed: ${await editRes.text()}`);
                }

                const operation = await editRes.json();

                return NextResponse.json({
                    success: true,
                    projectId,
                    screenIds,
                    operation,
                    previewUrl: `https://stitch.google.com/project/${projectId}`,
                    message: "Design edit in progress. Changes will appear in 30-60 seconds.",
                });
            }

            // ── VARIANT: Generate design alternatives ─────────────────────────
            case "variant": {
                const { projectId, screenIds, variantPrompt, count = 2 } = body;

                if (!projectId || !screenIds?.length) {
                    return NextResponse.json({ error: "projectId and screenIds required" }, { status: 400 });
                }

                const variantRes = await fetch(`${STITCH_BASE}/projects/${projectId}/screens:generateVariants`, {
                    method: "POST",
                    headers: stitchHeaders(),
                    body: JSON.stringify({
                        prompt: variantPrompt || "Generate a variant with different color scheme and layout",
                        selectedScreenIds: screenIds,
                        variantOptions: {
                            numberOfVariants: Math.min(count, 4),
                            creativeRange: "MODERATE",
                        },
                    }),
                });

                if (!variantRes.ok) {
                    throw new Error(`Variant generation failed: ${await variantRes.text()}`);
                }

                const operation = await variantRes.json();

                return NextResponse.json({
                    success: true,
                    projectId,
                    operation,
                    previewUrl: `https://stitch.google.com/project/${projectId}`,
                    message: `${count} design variants are being generated.`,
                });
            }

            // ── GET SCREEN: Retrieve a specific screen's details ───────────────
            case "get_screen": {
                const { projectId, screenId } = body;

                if (!projectId || !screenId) {
                    return NextResponse.json({ error: "projectId and screenId required" }, { status: 400 });
                }

                const res = await fetch(`${STITCH_BASE}/projects/${projectId}/screens/${screenId}`, {
                    headers: stitchHeaders(),
                });

                if (!res.ok) {
                    throw new Error(`Get screen failed: ${await res.text()}`);
                }

                const screen = await res.json();

                return NextResponse.json({
                    success: true,
                    screen,
                    previewUrl: `https://stitch.google.com/project/${projectId}`,
                });
            }

            // ── LIST SCREENS: Get all screens in a project ─────────────────────
            case "list_screens": {
                const { projectId } = body;

                if (!projectId) {
                    return NextResponse.json({ error: "projectId required" }, { status: 400 });
                }

                const res = await fetch(`${STITCH_BASE}/projects/${projectId}/screens`, {
                    headers: stitchHeaders(),
                });

                if (!res.ok) {
                    throw new Error(`List screens failed: ${await res.text()}`);
                }

                const data = await res.json();
                const screens = (data.screens || []).map((s: Record<string, unknown>) => ({
                    id: (s.name as string)?.split("/screens/")[1],
                    name: s.name,
                    deviceType: s.deviceType,
                    createTime: s.createTime,
                    updateTime: s.updateTime,
                }));

                return NextResponse.json({
                    success: true,
                    projectId,
                    screens,
                    count: screens.length,
                    previewUrl: `https://stitch.google.com/project/${projectId}`,
                });
            }

            // ── QA INSPECT: Jules final quality gate ────────────────────────
            case "qa_inspect": {
                const { clientName, clientDomain, auditData: qaAuditData, sourceResourceName } = body;

                if (!clientName || !clientDomain) {
                    return NextResponse.json({ error: "clientName and clientDomain required" }, { status: 400 });
                }

                const { session, url } = await runJulesQAInspection({
                    clientName,
                    clientDomain,
                    auditData: qaAuditData,
                    sourceResourceName,
                });

                if (!session) {
                    return NextResponse.json({
                        success: false,
                        message: "Jules QA session failed to start. Check JULES_API_KEY in .env.local",
                    }, { status: 503 });
                }

                return NextResponse.json({
                    success: true,
                    action: "qa_inspect",
                    sessionId: session.name,
                    state: session.state,
                    title: session.title,
                    julesUrl: url,
                    message: `🔍 Jules QA Inspection started for ${clientName}. Jules is performing a 7-point quality check before going live.`,
                    checkpoints: [
                        "SEO & Structured Data",
                        "Performance & Core Web Vitals",
                        "Security",
                        "Accessibility (WCAG 2.1 AA)",
                        "Conversion Optimization",
                        "Mobile Responsiveness",
                        "Functional Testing",
                    ],
                });
            }

            default:
                return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
        }
    } catch (err) {
        console.error("[Stitch Website] Error:", err);
        return NextResponse.json({
            success: false,
            message: err instanceof Error ? err.message : String(err),
        }, { status: 500 });
    }
}
