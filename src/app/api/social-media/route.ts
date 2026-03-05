import { NextResponse } from "next/server";
import { SocialMediaAgent } from "@/lib/social-media-agent";

/**
 * Handles incoming API requests for the SocialMediaAgent.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, payload } = body;

        if (!action) {
            return NextResponse.json({ error: "Missing action in request body" }, { status: 400 });
        }

        switch (action) {
            case "draft": {
                const { type, topic } = payload;
                if (!type || !topic) {
                    return NextResponse.json({ error: "Missing type or topic for drafting" }, { status: 400 });
                }
                const text = await SocialMediaAgent.draftContent(type, topic);
                return NextResponse.json({ success: true, text });
            }

            case "respond": {
                const { message, platform } = payload;
                if (!message || !platform) {
                    return NextResponse.json({ error: "Missing message or platform for response" }, { status: 400 });
                }
                const text = await SocialMediaAgent.autoRespondToMessage(message, platform);
                return NextResponse.json({ success: true, text });
            }

            case "post": {
                const { content, platform } = payload;
                if (!content || !platform) {
                    return NextResponse.json({ error: "Missing content or platform for posting" }, { status: 400 });
                }
                const success = await SocialMediaAgent.postToSocialMedia(content, platform);
                return NextResponse.json({ success });
            }

            default:
                return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
        }
    } catch (error: unknown) {
        console.error("[SocialMediaRoute] Error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
    }
}
