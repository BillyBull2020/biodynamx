// ============================================================================
// LIVE DEMO — EMAIL API ROUTE
// ============================================================================
// Enables AI agents to send professional emails during live conversations.
// Uses a simple SMTP/API approach. Falls back to logging if not configured.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";

// Email templates with professional HTML
function buildEmailHtml(template: string, data: Record<string, string>): { subject: string; html: string } {
    const name = data.prospectName || "there";
    const agentName = data.agentName || "BioDynamX Team";

    switch (template) {
        case "audit_results":
            return {
                subject: `📊 Your BioDynamX AI Audit Results — Revenue Recovery Opportunities Found`,
                html: `
<!DOCTYPE html>
<html>
<body style="background: #0a0a0a; color: #ffffff; font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px 20px;">
<div style="max-width: 600px; margin: 0 auto; background: #111; border: 1px solid #222; border-radius: 16px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #00ff41; font-size: 28px; margin: 0;">🧬 BioDynamX</h1>
        <p style="color: #888; font-size: 14px;">AI-Powered Revenue Recovery</p>
    </div>
    <h2 style="color: #fff;">Hey ${name},</h2>
    <p style="color: #ccc; line-height: 1.7;">Great talking with you! As promised, here are your AI audit results. Our analysis found <strong style="color: #00ff41;">recoverable revenue opportunities</strong> in your business.</p>
    <div style="background: rgba(0,255,65,0.05); border: 1px solid rgba(0,255,65,0.2); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <a href="${data.auditUrl || 'https://biodynamx.com/audit'}" style="display: inline-block; background: linear-gradient(135deg, #00ff41, #00cc33); color: #000; font-weight: 700; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px;">View Your Full Audit Report →</a>
    </div>
    <p style="color: #888; font-size: 14px;">Next step: Reply to this email or call (303) 392-3700 to have Jenny walk you through the findings and build your custom AI recovery plan.</p>
    <hr style="border: none; border-top: 1px solid #222; margin: 32px 0;" />
    <p style="color: #555; font-size: 12px; text-align: center;">BioDynamX Engineering Group × AI Expert Solutions<br/>$2.4M+ recovered for partners this quarter<br/><a href="https://biodynamx.com" style="color: #00ff41;">biodynamx.com</a></p>
</div>
</body>
</html>`,
            };

        case "thank_you":
            return {
                subject: `🎉 Welcome to BioDynamX — Your AI Revenue Recovery Starts Now`,
                html: `
<!DOCTYPE html>
<html>
<body style="background: #0a0a0a; color: #ffffff; font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px 20px;">
<div style="max-width: 600px; margin: 0 auto; background: #111; border: 1px solid #222; border-radius: 16px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #00ff41; font-size: 28px; margin: 0;">🧬 BioDynamX</h1>
        <p style="color: #888; font-size: 14px;">Welcome to the Partner Family</p>
    </div>
    <h2 style="color: #fff;">Welcome, ${name}! 🎉</h2>
    <p style="color: #ccc; line-height: 1.7;">You just made one of the smartest investments in your business. Here's your roadmap:</p>
    <div style="margin: 24px 0;">
        <div style="display: flex; align-items: start; margin-bottom: 16px; gap: 12px;">
            <span style="background: #00ff41; color: #000; font-weight: 700; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;">1</span>
            <div><strong style="color: #fff;">Deep Diagnostic (24h)</strong><br/><span style="color: #888;">Jenny will call for a comprehensive analysis</span></div>
        </div>
        <div style="display: flex; align-items: start; margin-bottom: 16px; gap: 12px;">
            <span style="background: #00ff41; color: #000; font-weight: 700; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;">2</span>
            <div><strong style="color: #fff;">Custom AI Plan (Week 1)</strong><br/><span style="color: #888;">Mark builds your revenue recovery system</span></div>
        </div>
        <div style="display: flex; align-items: start; margin-bottom: 16px; gap: 12px;">
            <span style="background: #00ff41; color: #000; font-weight: 700; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;">3</span>
            <div><strong style="color: #fff;">Revenue Recovery (Day 14)</strong><br/><span style="color: #888;">Start seeing measurable results</span></div>
        </div>
    </div>
    ${data.checkoutUrl ? `
    <div style="background: rgba(59,130,246,0.05); border: 1px solid rgba(59,130,246,0.2); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="color: #ccc; margin: 0 0 12px;">Your Partner Agreement:</p>
        <a href="${data.checkoutUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; font-weight: 700; padding: 14px 32px; border-radius: 8px; text-decoration: none;">View Agreement →</a>
    </div>` : ''}
    <p style="color: #ccc; line-height: 1.7;">Remember: <strong style="color: #00ff41;">5x ROI guaranteed</strong> or your money back. We're in this together.</p>
    <p style="color: #ccc;">— Billy De La Taurus<br/><span style="color: #888;">Founder & CEO, BioDynamX Engineering Group</span></p>
    <hr style="border: none; border-top: 1px solid #222; margin: 32px 0;" />
    <p style="color: #555; font-size: 12px; text-align: center;">BioDynamX Engineering Group × AI Expert Solutions<br/><a href="https://biodynamx.com" style="color: #00ff41;">biodynamx.com</a> · <a href="https://facebook.com/mmapresident" style="color: #3b82f6;">Join 4,000+ Partners</a></p>
</div>
</body>
</html>`,
            };

        case "demo_wow":
            return {
                subject: `⚡ ${agentName} just sent you this — in real-time, while you were talking`,
                html: `
<!DOCTYPE html>
<html>
<body style="background: #0a0a0a; color: #ffffff; font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px 20px;">
<div style="max-width: 600px; margin: 0 auto; background: #111; border: 1px solid #222; border-radius: 16px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #00ff41; font-size: 28px; margin: 0;">🧬 BioDynamX</h1>
        <p style="color: #888; font-size: 14px;">Live Demo — AI in Action</p>
    </div>
    <h2 style="color: #fff;">Hey ${name} 👋</h2>
    <p style="color: #ccc; line-height: 1.7;">This email was generated and sent by <strong style="color: #00ff41;">${agentName}</strong>, our AI agent — <em>while you were talking to ${data.agentName === 'Aria' ? 'her' : 'them'}</em>.</p>
    <p style="color: #ccc; line-height: 1.7;">No human pressed send. No template was manually triggered. The AI decided this was the right moment, composed this message, and delivered it — all in under 2 seconds.</p>
    <div style="background: rgba(0,255,65,0.05); border: 1px solid rgba(0,255,65,0.2); border-radius: 12px; padding: 24px; margin: 24px 0;">
        <p style="color: #00ff41; font-weight: 700; margin: 0 0 8px;">💡 This is what BioDynamX does for YOUR business:</p>
        <ul style="color: #ccc; margin: 0; padding-left: 20px; line-height: 2;">
            <li>Every missed call → instant text-back in 8 seconds</li>
            <li>Every lead → personalized follow-up sequence</li>
            <li>Every inquiry → smart qualification + booking</li>
            <li>24/7/365 — never misses, never sleeps</li>
        </ul>
    </div>
    <div style="text-align: center; margin: 32px 0;">
        <a href="https://biodynamx.com/audit" style="display: inline-block; background: linear-gradient(135deg, #00ff41, #00cc33); color: #000; font-weight: 700; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px;">Get Your Free AI Audit →</a>
    </div>
    <hr style="border: none; border-top: 1px solid #222; margin: 32px 0;" />
    <p style="color: #555; font-size: 12px; text-align: center;">Sent autonomously by ${agentName} · BioDynamX Engineering Group<br/><a href="https://biodynamx.com" style="color: #00ff41;">biodynamx.com</a> · (303) 392-3700</p>
</div>
</body>
</html>`,
            };

        default:
            return {
                subject: `${agentName} from BioDynamX — Following Up`,
                html: `<p>Hey ${name}, thanks for connecting with BioDynamX! Visit <a href="https://biodynamx.com">biodynamx.com</a> to learn more.</p>`,
            };
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { to, template, prospectName, agentName, auditUrl, checkoutUrl, customSubject, customBody } = body;

        if (!to) {
            return NextResponse.json({ error: "Email address required" }, { status: 400 });
        }

        const data = { prospectName, agentName, auditUrl, checkoutUrl };
        const email = template === "custom"
            ? { subject: customSubject || "BioDynamX — Following Up", html: customBody || "" }
            : buildEmailHtml(template || "demo_wow", data);

        // Try to send via configured email service
        // Priority: Resend > SendGrid > Fallback logging
        const resendKey = process.env.RESEND_API_KEY;
        const sendgridKey = process.env.SENDGRID_API_KEY;

        if (resendKey) {
            // Resend API
            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${resendKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from: `BioDynamX AI <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
                    to: [to],
                    subject: email.subject,
                    html: email.html,
                }),
            });
            const result = await response.json();
            console.log(`✅ Email sent via Resend → ${to} (${template})`);
            return NextResponse.json({ success: true, provider: "resend", id: result.id, template });
        }

        if (sendgridKey) {
            // SendGrid API
            const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${sendgridKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    personalizations: [{ to: [{ email: to }] }],
                    from: { email: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev", name: "BioDynamX AI" },
                    subject: email.subject,
                    content: [{ type: "text/html", value: email.html }],
                }),
            });
            console.log(`✅ Email sent via SendGrid → ${to} (${template})`);
            return NextResponse.json({ success: true, provider: "sendgrid", status: response.status, template });
        }

        // Fallback: log the email (no provider configured)
        console.log(`📧 Email (no provider) → ${to}: ${email.subject}`);
        return NextResponse.json({
            success: true,
            provider: "logged",
            to,
            subject: email.subject,
            template,
            note: "Email logged — configure RESEND_API_KEY or SENDGRID_API_KEY to send real emails",
        });
    } catch (error) {
        console.error("❌ Live demo email error:", error);
        return NextResponse.json(
            { error: "Failed to send email", details: String(error) },
            { status: 500 }
        );
    }
}
