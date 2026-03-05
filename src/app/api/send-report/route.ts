import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "@/lib/twilio";
import { sendAuditEmail, sendROIReportEmail } from "@/lib/resend";

// ═══════════════════════════════════════════════════════════════════════════════
// SEND REPORT — Audit reports and monthly ROI reports via SMS + Email
// ═══════════════════════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { phone, email, name, auditData, domain, trigger, period, clientId } = body;

        if (!phone && !email) {
            return NextResponse.json({ error: "Phone or email is required" }, { status: 400 });
        }

        const results: {
            sms?: { success: boolean; sid?: string };
            email?: { success: boolean; messageId?: string; simulated?: boolean };
        } = {};

        // ── Monthly ROI Report (triggered by Stripe renewal or manual request) ──
        if (trigger === "monthly_renewal" || body.reportType === "roi") {
            if (email) {
                // Fetch live ROI data if clientId provided
                let roiData = body.roiData || {};
                if (clientId) {
                    try {
                        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://biodynamx.com";
                        const res = await fetch(`${appUrl}/api/client-roi?clientId=${clientId}`);
                        roiData = await res.json();
                    } catch { /* use provided data */ }
                }

                const emailResult = await sendROIReportEmail({
                    to: email,
                    name: name || "Valued Client",
                    period: period || new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
                    totalInvested: roiData.roi?.totalInvested || 497,
                    totalReturned: roiData.roi?.totalReturned || 0,
                    multiple: roiData.roi?.multiple || 0,
                    leadsCapured: roiData.revenue?.leadsCapured || 0,
                    revenueGenerated: roiData.revenue?.revenueGenerated || 0,
                    topWins: (roiData.recentWins || []).slice(0, 5).map((w: { description?: string; type?: string }) => w.description || w.type || ""),
                    dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://biodynamx.com"}/dashboard/client`,
                });
                results.email = emailResult;
            }
            return NextResponse.json({
                success: true,
                trigger: "monthly_roi_report",
                deliveredVia: Object.keys(results),
                results,
            });
        }

        // ── Audit Report ──────────────────────────────────────────────────────
        const d = auditData || {};
        const siteScore = d.siteSpeed?.score || d.siteSpeedScore || 0;
        const seoScore = d.seo?.score || d.seoScore || 0;
        const mobileScore = d.mobile?.score || d.mobileScore || 0;
        const aeoScore = d.deepDiagnostic?.aeoDeep?.structuredDataScore || d.aeoScore || 0;
        const leaking = d.revenueEstimate?.leakingRevenue || d.leakingRevenuePerMonth || "$0/mo";
        const missedCalls = d.callToVoicemail?.missedCallsPerMonth || d.missedCallsPerMonth || 0;
        const urgency = d.needsAssessment?.urgencyLevel || d.urgencyLevel || "medium";
        const primaryNeed = d.needsAssessment?.primaryNeed || d.primaryNeed || "Website optimization";
        const painPoints = d.needsAssessment?.identifiedPainPoints || d.identifiedPainPoints || [];
        const solutions = d.needsAssessment?.recommendedSolutions || d.recommendedSolutions || [];

        // ── Send via Email (REAL — Resend) ──
        if (email) {
            const emailResult = await sendAuditEmail({
                to: email,
                name: name || "there",
                domain: domain || d.url || "your website",
                overallScore: Number(siteScore),
                seoScore: Number(seoScore),
                aeoScore: Number(aeoScore),
                speedScore: Number(siteScore),
                mobileScore: Number(mobileScore),
                monthlyLeak: String(leaking),
                missedCalls: Number(missedCalls),
                checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://biodynamx.com"}/#pricing`,
            });
            results.email = emailResult;
        }

        // ── Send via SMS ──────────────────────────────────────────────────────
        if (phone) {
            const greeting = name ? `Hey ${name}!` : "Hey!";
            const domainLabel = domain || d.url || "your website";

            const smsReport = `${greeting} 📊 BioDynamX Diagnostic for ${domainLabel}:

📱 Mobile: ${mobileScore}/100
🔍 SEO: ${seoScore}/100
🤖 AI Visibility: ${aeoScore}/100
💰 Revenue Leak: ${leaking}
📞 Missed Calls: ${missedCalls}/mo
⚡ Priority: ${urgency.toUpperCase()}

Top issue: ${primaryNeed}
${painPoints.length > 0 ? "\\n" + painPoints.slice(0, 2).map((p: string, i: number) => `${i + 1}. ${p}`).join("\\n") : ""}

Fix it → https://biodynamx.com/#pricing
— Billy & BioDynamX AI Team`;

            const cleanPhone = phone.replace(/[^\d+]/g, "");
            const formattedPhone = cleanPhone.startsWith("+") ? cleanPhone : `+1${cleanPhone}`;
            const r = await sendSMS(formattedPhone, smsReport);
            results.sms = { success: r.success, sid: r.sid || undefined };
        }

        return NextResponse.json({
            success: true,
            deliveredVia: Object.keys(results),
            results,
            message: `Report sent to ${name || "prospect"} via ${Object.keys(results).join(" + ")}`,
        });
    } catch (err) {
        console.error("[Send Report] Error:", err);
        return NextResponse.json({
            success: false,
            error: "Failed to send report: " + String(err),
        }, { status: 500 });
    }
}

