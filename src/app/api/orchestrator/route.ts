// ═══════════════════════════════════════════════════════════════════
// /api/orchestrator/route.ts — Master Orchestrator API
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getOrchestrator, NEW_AGENT_TEMPLATES } from "@/lib/master-orchestrator";

// GET: Get orchestrator status
export async function GET() {
    const orchestrator = getOrchestrator();

    return NextResponse.json({
        service: "BioDynamX Master Orchestrator",
        status: "active",
        ...orchestrator.getStatus(),
        agents: orchestrator.getActiveAgents().map(a => ({
            id: a.id,
            name: a.name,
            role: a.role,
            voice: a.voice,
            tools: a.tools,
            closingAuthority: a.closingAuthority,
            maxAutonomy: a.maxAutonomy,
        })),
        learnings: orchestrator.getLearnings().length,
        performance: orchestrator.getAllPerformance(),
        availableTemplates: Object.keys(NEW_AGENT_TEMPLATES),
    });
}

// POST: Route a request, train an agent, or record a learning
export async function POST(req: NextRequest) {
    const orchestrator = getOrchestrator();

    try {
        const body = await req.json();

        switch (body.action) {
            case "route": {
                const decision = orchestrator.routeRequest(body.input, body.context);
                return NextResponse.json({ decision });
            }

            case "train": {
                const template = body.template || NEW_AGENT_TEMPLATES[body.templateKey as keyof typeof NEW_AGENT_TEMPLATES];
                if (!template) {
                    return NextResponse.json(
                        { error: `Unknown template: ${body.templateKey}` },
                        { status: 400 }
                    );
                }
                const agent = orchestrator.trainNewAgent(template);
                return NextResponse.json({ agent });
            }

            case "clone": {
                const cloned = orchestrator.cloneExistingAgent(body.sourceAgentId, body.newName);
                if (!cloned) {
                    return NextResponse.json(
                        { error: "Source agent not found" },
                        { status: 404 }
                    );
                }
                return NextResponse.json({ agent: cloned });
            }

            case "record_outcome": {
                orchestrator.recordSessionOutcome(body.sessionData);
                return NextResponse.json({ success: true, message: "Outcome recorded and learnings extracted" });
            }

            case "record_learning": {
                orchestrator.recordLearning(body.learning);
                return NextResponse.json({ success: true, message: "Learning recorded" });
            }

            default:
                return NextResponse.json(
                    { error: "Unknown action. Available: route, train, clone, record_outcome, record_learning" },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error("Orchestrator API error:", error);
        return NextResponse.json(
            { error: "Orchestrator error: " + String(error) },
            { status: 500 }
        );
    }
}
