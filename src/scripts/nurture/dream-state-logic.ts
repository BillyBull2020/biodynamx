// ─── BioDynamX Dream State Engine ───────────────────────
// Industry-specific "Future Vision" scripts that Journey & Mark
// use to paint the client's dream state during the close.

export interface DreamStateScript {
    industry: string;
    dreamName: string;
    journeyScript: string;
    markScript: string;
    fearOfLoss: string;
    roiBridge: string;
    smsFollowUp: string;
}

const DREAM_STATES: Record<string, DreamStateScript> = {
    real_estate: {
        industry: "Real Estate",
        dreamName: "The 24/7 Closer",
        journeyScript:
            "While you're at a showing, 5 leads just went to voicemail. " +
            "Our AI agent just text-back all 5, qualified them, and put them " +
            "on your calendar for tomorrow. You didn't lift a finger. " +
            "That's a $200k commission saved.",
        markScript:
            "I'm looking at your call logs right now. Last month, 47 inbound " +
            "calls went to voicemail during showings and open houses. At your " +
            "average commission of $12,000, that's potentially $564,000 in lost " +
            "revenue. Our Voice Agent picks up in 0.4 seconds, every time.",
        fearOfLoss:
            "Every hour without this system, you're bleeding leads to the agent " +
            "down the street who DOES answer on the first ring.",
        roiBridge:
            "At $497/mo, you only need ONE recovered commission per quarter to " +
            "hit 15x ROI. We guarantee 2x or we keep working for free.",
        smsFollowUp:
            "Hey {{firstName}}, Journey here from BioDynamX. I just found 3 " +
            "leads that called your office this week and got voicemail. Want me " +
            "to show you what happened to them? 📱",
    },

    ecommerce: {
        industry: "E-Commerce",
        dreamName: "The Passive Scaler",
        journeyScript:
            "Your cart abandonment is at 70%. Mark is installing the 'Recovery " +
            "Agent' right now. It doesn't send generic emails; it starts a " +
            "human-like text conversation to solve their doubt. We turn your " +
            "'Maybe' into 'Paid' while you sleep.",
        markScript:
            "I've scanned your Shopify analytics. You're getting 2,400 add-to-carts " +
            "per month but only converting 720. That's 1,680 people who WANTED to " +
            "buy but didn't. At your $85 AOV, that's $142,800/mo walking out the " +
            "door. Our Recovery Agent typically recaptures 15–22% of those.",
        fearOfLoss:
            "Your competitors are already using AI cart recovery. Every abandoned " +
            "cart is a customer choosing THEM because they followed up and you didn't.",
        roiBridge:
            "If we recover just 10% of your abandoned carts, that's $14,280/mo " +
            "in new revenue. Your investment is $497/mo. That's a 28x return.",
        smsFollowUp:
            "Hey {{firstName}}, Journey from BioDynamX. I just ran your store " +
            "through our leak detector — you're losing ${{leakingRevenue}} per " +
            "month from cart abandonment alone. Want the fix? 🛒",
    },

    medspa: {
        industry: "Med-Spa / Service",
        dreamName: "The Perfect Reputation",
        journeyScript:
            "You have 3 low reviews from 2024 killing your GMB ranking. Mark is " +
            "deploying the 'Review Shield' to automate 5-star requests from your " +
            "happiest clients today. We're moving you to #1 on the map by Friday.",
        markScript:
            "I just audited your Google My Business. You're sitting at 4.2 stars " +
            "with 89 reviews. Your top competitor has 4.8 stars with 312 reviews. " +
            "That gap is costing you the #1 map pack position and roughly " +
            "$23,000/mo in walk-in revenue. The Review Shield fixes this in 30 days.",
        fearOfLoss:
            "Right now, 3 out of 4 potential clients see your competitor FIRST on " +
            "Google Maps. Every day without the Review Shield is another day they " +
            "own your market.",
        roiBridge:
            "Moving from position #4 to #1 on the map pack typically increases " +
            "monthly bookings by 40%. At your average ticket of $350, that's an " +
            "additional $14,000/mo. Your investment: $497/mo.",
        smsFollowUp:
            "Hey {{firstName}}, Journey from BioDynamX. I just checked your GMB " +
            "listing — you have {{unansweredReviews}} unanswered reviews dragging " +
            "your ranking down. Want me to show you the 30-day fix? ⭐",
    },
};

/**
 * Get the dream state script for a given industry.
 * Falls back to ecommerce if the industry isn't found.
 */
export function getDreamState(industry: string): DreamStateScript {
    const key = industry.toLowerCase().replace(/[\s\-\/]/g, "_");

    // Try exact match first, then partial match
    if (DREAM_STATES[key]) return DREAM_STATES[key];

    for (const [k, v] of Object.entries(DREAM_STATES)) {
        if (key.includes(k) || k.includes(key)) return v;
    }

    // Default fallback
    return DREAM_STATES.ecommerce;
}

/**
 * Get all available dream states
 */
export function getAllDreamStates(): DreamStateScript[] {
    return Object.values(DREAM_STATES);
}

/**
 * Interpolate template variables in SMS/email copy
 */
export function interpolateTemplate(
    template: string,
    vars: Record<string, string | number>
): string {
    return template.replace(
        /\{\{(\w+)\}\}/g,
        (_, key) => String(vars[key] ?? `{{${key}}}`)
    );
}

export default DREAM_STATES;
