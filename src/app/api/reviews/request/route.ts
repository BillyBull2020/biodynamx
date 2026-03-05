// ============================================================================
// /api/reviews/request — Review Request SMS Campaign
// ============================================================================
// Sends a personalized SMS to a customer asking them to leave a Google review.
// Works immediately with existing Twilio — no Google API needed.
//
// Usage:
//   POST /api/reviews/request
//   Body: { phone: "+1...", name: "John", businessName: "Acme Dental" }
//
// Or for bulk:
//   POST /api/reviews/request
//   Body: { bulk: [{ phone: "+1...", name: "John" }, ...], businessName: "Acme Dental" }
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "@/lib/twilio";

// Google review link templates
// Format: https://search.google.com/local/writereview?placeid=PLACE_ID
// Or the simple version: https://g.page/BUSINESS/review
const REVIEW_TEMPLATES = {
    // Immediate post-service (highest conversion — send within 1 hour)
    immediate: (name: string, businessName: string, reviewLink: string) =>
        `Hey ${name}! 😊 Thanks for choosing ${businessName}. We'd love to hear about your experience — a quick Google review means the world to us: ${reviewLink} — Thank you! 🙏`,

    // Follow-up (if they didn't leave a review after 24 hours)
    followUp: (name: string, businessName: string, reviewLink: string) =>
        `Hi ${name}, just following up from your visit to ${businessName}. If you have 30 seconds, a Google review would really help other customers find us: ${reviewLink} — Thanks!`,

    // After positive interaction (when you know they're happy)
    happy: (name: string, businessName: string, reviewLink: string) =>
        `${name}, so glad we could help! 🎉 If you'd share your experience with a quick Google review, it would mean everything to our team: ${reviewLink}`,

    // Gentle reminder (7 days later)
    reminder: (name: string, businessName: string, reviewLink: string) =>
        `Hey ${name}! Quick reminder — if you enjoyed your experience at ${businessName}, we'd appreciate a Google review when you get a chance: ${reviewLink} — No pressure at all! 😊`,
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const {
            phone,
            name,
            businessName = "BioDynamX",
            googlePlaceId,
            googleBusinessUrl,
            template = "immediate",
            bulk,
        } = body;

        // Build the review link
        let reviewLink: string;
        if (googlePlaceId) {
            reviewLink = `https://search.google.com/local/writereview?placeid=${googlePlaceId}`;
        } else if (googleBusinessUrl) {
            reviewLink = googleBusinessUrl;
        } else {
            // Default: direct Google search with review intent
            reviewLink = `https://www.google.com/search?q=${encodeURIComponent(businessName)}+reviews`;
        }

        // Handle bulk requests
        if (bulk && Array.isArray(bulk)) {
            const results = await Promise.allSettled(
                bulk.map(async (contact: { phone: string; name: string; template?: string }) => {
                    const tmpl = (contact.template || template) as keyof typeof REVIEW_TEMPLATES;
                    const templateFn = REVIEW_TEMPLATES[tmpl] || REVIEW_TEMPLATES.immediate;
                    const smsBody = templateFn(contact.name || "there", businessName, reviewLink);
                    return sendSMS(contact.phone, smsBody);
                })
            );

            const sent = results.filter(r => r.status === "fulfilled").length;
            const failed = results.filter(r => r.status === "rejected").length;

            return NextResponse.json({
                success: true,
                sent,
                failed,
                total: bulk.length,
                message: `Review requests sent: ${sent}/${bulk.length}`,
            });
        }

        // Single request
        if (!phone) {
            return NextResponse.json(
                { error: "Phone number required. Send { phone: '+1...', name: 'John' }" },
                { status: 400 }
            );
        }

        const tmpl = template as keyof typeof REVIEW_TEMPLATES;
        const templateFn = REVIEW_TEMPLATES[tmpl] || REVIEW_TEMPLATES.immediate;
        const smsBody = templateFn(name || "there", businessName, reviewLink);

        const result = await sendSMS(phone, smsBody);

        return NextResponse.json({
            success: result.success,
            message: result.success
                ? `Review request sent to ${phone}`
                : `Failed to send to ${phone}`,
            sid: result.sid,
            reviewLink,
        });
    } catch (error) {
        console.error("[Review Request] Error:", error);
        return NextResponse.json(
            { error: "Failed to send review request" },
            { status: 500 }
        );
    }
}

// GET — Service info
export async function GET() {
    return NextResponse.json({
        service: "BioDynamX Review Request Campaign",
        status: "active",
        description: "Send personalized SMS asking customers for Google reviews",
        templates: Object.keys(REVIEW_TEMPLATES),
        usage: {
            single: "POST /api/reviews/request { phone: '+1...', name: 'John', businessName: 'Acme' }",
            bulk: "POST /api/reviews/request { bulk: [{phone, name}, ...], businessName: 'Acme' }",
        },
        tip: "Set googlePlaceId for a direct Google review link, or googleBusinessUrl for a custom URL",
    });
}
