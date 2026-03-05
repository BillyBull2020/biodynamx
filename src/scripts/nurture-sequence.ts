import sgMail from '@sendgrid/mail';
import twilio from 'twilio';

// Configure these securely in production
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

interface ProspectData {
    name?: string;
    phone: string;
    email: string;
    metrics: {
        leakingRevenue: string;
        targetROIMultiplier: number;
        competitorName?: string;
    };
}

/**
 * THE "NEVER-LET-GO" (FEAR OF LOSS) AUTOMATED NURTURE SEQUENCE
 */
export const FollowUpEngine = {
    triggerSequence: async (prospect: ProspectData) => {
        console.log(`[FollowUpEngine] Firing "Never-Let-Go" sequence for ${prospect.phone}`);

        try {
            // STEP 1: +5 Mins (Text) - Immediate Fear of Loss injection by Journey
            setTimeout(async () => {
                const message = `Hey, it's Journey from BioDynamX. Mark just finished the deeper SEO/GEO audit we discussed. You're actually losing ${prospect.metrics.leakingRevenue} more than we initially thought. I put the technical breakdown in your dashboard. Check it.`;
                if (process.env.TWILIO_ACCOUNT_SID) {
                    await twilioClient.messages.create({
                        body: message,
                        from: process.env.TWILIO_PHONE_NUMBER,
                        to: prospect.phone,
                    });
                } else {
                    console.log(`[MOCK TEXT to ${prospect.phone}]: ${message}`);
                }
            }, 5 * 60 * 1000); // 5 mins

            // STEP 2: +1 Hour (Email) - The Veo 3 Video Simulation showing competitor advantage
            setTimeout(async () => {
                const competitorText = prospect.metrics.competitorName ? ` ${prospect.metrics.competitorName} is` : "your competitors are";
                const emailHtml = `
                    <div style="font-family: sans-serif; color: #111;">
                        <h2>The Digital Leak is widening.</h2>
                        <p>I ran an Answer Engine Optimization (AEO) simulation against your current traffic.</p>
                        <p>Because you lack Semantic Triples and AI FAQ architecture, ${competitorText} intercepting your highest-intent leads right now.</p>
                        <p><b>[Placeholder: Insert 30-sec Veo 3 Audit Breakdown Video Here]</b></p>
                        <p>This video shows exactly how AI is routing your prospects to them instead of you.</p>
                        <p>- Mark</p>
                    </div>
                `;
                if (process.env.SENDGRID_API_KEY) {
                    await sgMail.send({
                        to: prospect.email,
                        from: 'mark@biodynamx.com',
                        subject: "Your AEO/GEO Leak Simulation Results",
                        html: emailHtml,
                    });
                } else {
                    console.log(`[MOCK EMAIL to ${prospect.email}]: Subject: Your AEO/GEO Leak Simulation Results`);
                }
            }, 60 * 60 * 1000); // 1 hour

            // STEP 3: +24 Hours (AI Voice Call) - The Dream & Scarcity by Mark
            setTimeout(async () => {
                // In production, this would trigger an outbound VAPI or Twilio Voice call
                console.log(`[MOCK OUTBOUND CALL to ${prospect.phone} Triggered]`);
                console.log(`Mark's Script: "I have a gap in our implementation sprint starting Monday. Do you want the ${prospect.metrics.targetROIMultiplier}x ROI slot, or should I release it?"`);
            }, 24 * 60 * 60 * 1000); // 24 hours

        } catch (err) {
            console.error("[FollowUpEngine] Sequence initialization failed:", err);
        }
    }
};
