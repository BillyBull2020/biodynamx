// ─── Journey's "Dr. Bluntness" SMS Sequences ───────────
// Fear of Loss nurture system — relentless but elegant.
// Each stage escalates urgency while maintaining authority.

export interface SMSSequence {
    /** Sent immediately after audit (T+5 min) */
    triggerOne: string;
    /** Sent after 1 hour of silence */
    triggerTwo: string;
    /** Sent after 24 hours — scarcity lock */
    triggerThree: string;
    /** Mark's follow-up call script (T+48 hrs) */
    markCallScript: string;
}

export const smsTemplates: Record<string, SMSSequence> = {
    ecommerce: {
        triggerOne:
            "Hey {{firstName}}, it's Journey from BioDynamX. Mark just finished your deep AEO audit. " +
            "I hate to be the one to tell you, but you're being manually bypassed by Gemini's AI Overviews " +
            "in favor of {{competitor}}. That's roughly ${{monthlyLeak}} in monthly revenue you're donating to them. " +
            "Mark has the 'Medication' ready. You in?",
        triggerTwo:
            "{{firstName}}, quick follow-up. Your cart abandonment rate is {{cartAbandonment}}%. " +
            "That's {{abandonedCarts}} people per month who WANTED to buy from you but didn't. " +
            "Our Recovery Agent turns 22% of those into revenue — while you sleep. " +
            "Want the ROI math? 📊",
        triggerThree:
            "Last message, {{firstName}}. We only take 2 clients per niche to protect the ROI guarantee. " +
            "{{competitor}} is in our pipeline for your sector. Once they lock in, your slot closes. " +
            "Mark has your 2.1x ROI bridge ready. Yes or no?",
        markCallScript:
            "Hi {{firstName}}, this is Mark from BioDynamX. Journey flagged your audit as critical priority. " +
            "You're losing ${{annualLeak}} per year from cart abandonment and AEO gaps. " +
            "I've built a custom Recovery Engine for your store — want me to walk you through the ROI bridge?",
    },

    realestate: {
        triggerOne:
            "Hey {{firstName}}, it's Journey from BioDynamX. I just found 3 leads that called your " +
            "office this week and got voicemail. At your commission level, that's ${{weeklyLoss}} that walked " +
            "out the door. Mark has the fix ready — a 24/7 AI Concierge that never misses a call. Want it? 📱",
        triggerTwo:
            "{{firstName}}, while you were at a showing today, {{missedCalls}} calls went to voicemail. " +
            "Your competitor {{competitor}} has an AI that texts back in 0.4 seconds. " +
            "Those leads are now THEIR leads. We can stop the bleeding tonight.",
        triggerThree:
            "Final follow-up, {{firstName}}. We only protect 2 agents per market. " +
            "Someone in your area just requested a demo. Once they lock in, we can't service both of you — " +
            "exclusivity is part of the 2.1x guarantee. Mark's line is open for 24 hours.",
        markCallScript:
            "Hi {{firstName}}, Mark here. Journey ran the numbers on your missed-call hemorrhage. " +
            "At {{missedCalls}} calls per week going to voicemail, with your average commission of ${{avgCommission}}, " +
            "that's ${{annualLeak}} per year in lost closings. I have the Lead Concierge ready to deploy tonight.",
    },

    medspa: {
        triggerOne:
            "Hey {{firstName}}, Journey from BioDynamX. I just checked your GMB listing — " +
            "you have {{unansweredReviews}} unanswered reviews dragging your ranking down. " +
            "Meanwhile, {{competitor}} just hit 4.8 stars with 300+ reviews. " +
            "Mark has the 'Review Shield' ready. Want me to show you the 30-day fix? ⭐",
        triggerTwo:
            "{{firstName}}, someone searched 'best {{service}} near me' at 10 PM last night. " +
            "Your competitor showed up. You didn't. That's a ${{avgTicket}} treatment they booked " +
            "because YOUR booking system was a 'Closed' sign. We fix that tonight.",
        triggerThree:
            "Last chance, {{firstName}}. We're deploying Review Shield for a clinic in your area this week. " +
            "We can't protect two competing businesses with the same guarantee. " +
            "Mark has your reputation recovery plan locked and loaded. 48 hours left on your slot.",
        markCallScript:
            "Hi {{firstName}}, this is Mark. Journey flagged your GMB as critical — " +
            "you're at {{currentRating}} stars vs. your competitor's 4.8. " +
            "Harvard's research shows that gap costs you roughly ${{monthlyLoss}}/month in walk-ins. " +
            "The Review Shield fixes this in 30 days. Shall I deploy it today?",
    },

    default: {
        triggerOne:
            "Hey {{firstName}}, it's Journey from BioDynamX. Mark just finished your 360 audit. " +
            "You have a critical leak in your Google My Business — you're losing roughly " +
            "{{leadsPerWeek}} leads a week. Mark has the fix ready. Want the ROI bridge?",
        triggerTwo:
            "{{firstName}}, quick question: did you know that {{competitor}} is showing up in AI answers " +
            "for your keywords and you're not? That's ${{monthlyLeak}}/mo in traffic going to them. " +
            "We can fix that in 48 hours.",
        triggerThree:
            "Final follow-up, {{firstName}}. We only take 2 clients per niche to guarantee the 2.1x ROI. " +
            "Your slot is open for 24 more hours. After that, Mark releases it to the next business in queue.",
        markCallScript:
            "Hi {{firstName}}, Mark from BioDynamX. Journey forwarded your audit — " +
            "you're leaving ${{annualLeak}} per year on the table from missed calls, " +
            "AEO gaps, and reputation leaks. I have the engineering plan ready. " +
            "Want me to walk you through the numbers?",
    },
};

/**
 * Interpolate template variables in a message.
 * Variables use {{variableName}} format.
 */
export function interpolateSMS(
    template: string,
    vars: Record<string, string | number>
): string {
    return template.replace(
        /\{\{(\w+)\}\}/g,
        (_, key) => String(vars[key] ?? `[${key}]`)
    );
}

/**
 * Get the appropriate SMS sequence for an industry.
 * Falls back to default if industry not found.
 */
export function getSMSSequence(industry: string): SMSSequence {
    const key = industry.toLowerCase().replace(/[\s\-\/]/g, "");
    return smsTemplates[key] || smsTemplates.default;
}
