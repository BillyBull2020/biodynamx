import { NextResponse } from "next/server";
import { SocialMediaAgent } from "@/lib/social-media-agent";

// Replace with your actual Meta App Verify Token
const META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || "biodynamx_nana_banna_secure_token";

/**
 * GET Method: Webhook Verification for Meta (Instagram/Facebook)
 * Meta requires this endpoint to return the hub.challenge value when you first set up the webhook.
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode && token) {
        if (mode === "subscribe" && token === META_VERIFY_TOKEN) {
            console.log("[Meta Webhook] WEBHOOK_VERIFIED");
            return new NextResponse(challenge, { status: 200 }); // Meta requires exactly the challenge string back
        } else {
            console.warn("[Meta Webhook] Verification failed. Token mismatch.");
            return new NextResponse("Forbidden", { status: 403 });
        }
    }

    return new NextResponse("Bad Request", { status: 400 });
}

/**
 * POST Method: Receive Messages and Events
 * This handles incoming DMs, comments, etc., from Meta APIs.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();

        console.log("[Meta Webhook] Received Event:", JSON.stringify(body, null, 2));

        // Confirm it's an event from a Page/Instagram Account we subscribe to
        if (body.object === "page" || body.object === "instagram") {

            // Iterate over each entry. There may be multiple if batched.
            for (const entry of body.entry) {

                // Iterate over each messaging event
                const webhookEvent = entry.messaging?.[0]; // Usually Facebook Messenger

                // Also handle Instagram DMs/Comments if they come differently grouped
                const changesEvent = entry.changes?.[0];

                const messageText = webhookEvent?.message?.text || changesEvent?.value?.text;
                const senderId = webhookEvent?.sender?.id || changesEvent?.value?.from?.id;

                // Determine the platform roughly based on object type
                const platform = body.object === "instagram" ? "instagram" : "facebook";

                if (messageText && senderId) {
                    console.log(`[Meta Webhook] New message from ${senderId} on ${platform}: "${messageText}"`);

                    // 1. Process the message through our AI Agent
                    const aiResponse = await SocialMediaAgent.autoRespondToMessage(messageText, platform);
                    console.log(`[Meta Webhook] AI generated response: "${aiResponse}"`);

                    // 2. Here you would normally send the response back using Meta's Graph API:
                    const PAGE_ACCESS_TOKEN = process.env.META_PAGE_ACCESS_TOKEN;

                    if (PAGE_ACCESS_TOKEN) {
                        try {
                            const response = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    recipient: { id: senderId },
                                    message: { text: aiResponse }
                                })
                            });

                            if (!response.ok) {
                                console.error(`[Meta Webhook] Failed to send response via Graph API: ${response.statusText}`);
                            } else {
                                console.log(`[Meta Webhook] Response successfully sent via Graph API.`);
                            }
                        } catch (err) {
                            console.error(`[Meta Webhook] Error calling Graph API:`, err);
                        }
                    } else {
                        // Using our mocked "post" for now since we don't have the token configured yet!
                        console.warn(`[Meta Webhook] META_PAGE_ACCESS_TOKEN not found. Falling back to log-based post.`);
                        await SocialMediaAgent.postToSocialMedia(`Replying to ${senderId}: ${aiResponse}`, platform);
                    }
                }
            }

            // Meta expects a 200 OK fast to acknowledge receipt
            return new NextResponse("EVENT_RECEIVED", { status: 200 });
        } else {
            // Return a '404 Not Found' if event is not from a page subscription
            return new NextResponse("Not Found", { status: 404 });
        }
    } catch (error: unknown) {
        console.error("[Meta Webhook] Processing Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
