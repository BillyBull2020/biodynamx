// ═══════════════════════════════════════════════════════════════════════════
// /api/voice/respond — Aria's AI Brain for Inbound Calls
// ═══════════════════════════════════════════════════════════════════════════
// Receives what the caller said (from Twilio Gather), sends it to Gemini,
// returns TwiML with Aria's spoken response. Loops until done.
//
// On every turn:
//   1. Extract caller's speech from Twilio POST body
//   2. Send to Gemini for response (with Aria's context)
//   3. Capture lead info extracted from conversation
//   4. Return TwiML: Aria speaks, then gathers next turn
//   5. If intent = "schedule" or "info sent" → wrap up naturally
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://biodynamx.com";
const ARIA_VOICE = "Polly.Joanna";
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";

// In-memory conversation store (keyed by CallSid)
// In production, persist to Supabase sessions table
const conversations = new Map<string, { turns: { role: string; content: string }[]; leadData: LeadData }>();

interface LeadData {
    name?: string;
    phone?: string;
    email?: string;
    need?: string;
    captured: boolean;
}

const ARIA_SYSTEM = `You are Aria, the AI receptionist for a local business. You are warm, professional, and efficient.

YOUR MISSION:
1. Understand what the caller needs (appointment, question, price, emergency)
2. Capture their name and best callback number 
3. If they want an appointment: ask preferred day/time and confirm
4. If they have a question: answer it based on the business context, then offer to connect them
5. ALWAYS end with: "I've got that noted. Someone from our team will follow up shortly. Is there anything else I can help you with?"

CRITICAL RULES:
- Keep responses SHORT — no more than 2-3 sentences per turn (this is a phone call, not a chat)
- Be conversational and warm, not robotic
- If you detect an emergency (burst pipe, chest pain, etc.) — immediately say to call 911 or give the emergency line
- If the caller asks to speak to a human: "Absolutely! I'm connecting you now. While our team member picks up, can I get your name and best number?"
- Extract and remember: caller's name, their need, urgency level
- Do NOT make up business details you don't know — say "Let me have someone confirm that for you"

RESPONSE FORMAT:
Respond with ONLY the words Aria should say. No stage directions. No brackets. Just natural speech.`;

export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const callSid = searchParams.get("callSid") || "unknown";
    const callerNumber = searchParams.get("caller") || "Unknown";
    const noSpeech = searchParams.get("noSpeech") === "true";

    const body = await req.formData().catch(() => new FormData());
    const callerSpeech = body.get("SpeechResult") as string || "";
    const confidence = body.get("Confidence") as string || "0";

    console.log(`[Aria RESPOND] Turn for call ${callSid}: "${callerSpeech}" (confidence: ${confidence})`);

    // Init or retrieve conversation
    if (!conversations.has(callSid)) {
        conversations.set(callSid, {
            turns: [],
            leadData: { phone: callerNumber, captured: false },
        });
    }
    const convo = conversations.get(callSid)!;

    // Handle no speech / low confidence
    if (noSpeech || !callerSpeech || parseFloat(confidence) < 0.3) {
        const twiml = buildResponseTwiML(
            "I'm sorry, I didn't catch that. Let me transfer you to our team right away.",
            callSid, callerNumber, true // wrap = true
        );
        // Still capture the call as a lead
        await captureCallLead(convo.leadData, callSid, "No speech detected — transferred");
        return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
    }

    // Add caller speech to history
    convo.turns.push({ role: "user", content: callerSpeech });

    // Extract lead data from speech
    extractLeadData(callerSpeech, convo.leadData);

    // Generate Aria's response via Gemini
    let ariaResponse = "";
    let shouldWrap = false;

    try {
        if (!GEMINI_KEY) {
            // Graceful fallback without Gemini
            ariaResponse = generateFallbackResponse(callerSpeech, convo.turns.length, convo.leadData);
        } else {
            const genAI = new GoogleGenerativeAI(GEMINI_KEY);
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
                systemInstruction: ARIA_SYSTEM,
            });

            const history = convo.turns.slice(-6, -1).map(t => ({
                role: t.role as "user" | "model",
                parts: [{ text: t.content }],
            }));

            const chat = model.startChat({ history, generationConfig: { maxOutputTokens: 150, temperature: 0.7 } });
            const result = await chat.sendMessage(callerSpeech);
            ariaResponse = result.response.text()?.trim() || generateFallbackResponse(callerSpeech, convo.turns.length, convo.leadData);
        }

        // Check if we should wrap up (after 5+ turns or wrap signals in response)
        const wrapSignals = ["follow up shortly", "have a great day", "talk soon", "goodbye", "take care"];
        shouldWrap = convo.turns.length >= 6 || wrapSignals.some(s => ariaResponse.toLowerCase().includes(s));

        // Add Aria's response to history
        convo.turns.push({ role: "model", content: ariaResponse });

    } catch (err) {
        console.error("[Aria RESPOND] Gemini error:", err);
        ariaResponse = "I apologize for the technical difficulty. Let me connect you with our team right away.";
        shouldWrap = true;
    }

    // Capture lead when wrapping or after 3+ turns
    if (shouldWrap || convo.turns.length >= 3) {
        await captureCallLead(convo.leadData, callSid, callerSpeech, convo.turns);
    }

    // Return TwiML
    const twiml = buildResponseTwiML(ariaResponse, callSid, callerNumber, shouldWrap);
    return new NextResponse(twiml, {
        status: 200,
        headers: { "Content-Type": "text/xml" },
    });
}

// ── TwiML Builder ──────────────────────────────────────────────────────────────

function buildResponseTwiML(
    speech: string,
    callSid: string,
    callerNumber: string,
    wrap: boolean
): string {
    const escapedSpeech = escapeXml(speech);

    if (wrap) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${ARIA_VOICE}" language="en-US">${escapedSpeech}</Say>
  <Pause length="1"/>
  <Say voice="${ARIA_VOICE}">Have a wonderful day! Goodbye.</Say>
  <Hangup/>
</Response>`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${ARIA_VOICE}" language="en-US">${escapedSpeech}</Say>
  <Pause length="0.5"/>
  <Gather 
    input="speech" 
    timeout="8"
    speechTimeout="2"
    action="${APP_URL}/api/voice/respond?callSid=${callSid}&amp;caller=${encodeURIComponent(callerNumber)}"
    method="POST"
  >
    <Say voice="${ARIA_VOICE}">I'm listening.</Say>
  </Gather>
  <Say voice="${ARIA_VOICE}">Thank you for calling! Have a wonderful day.</Say>
  <Hangup/>
</Response>`;
}

// ── Lead Extraction ───────────────────────────────────────────────────────────

function extractLeadData(speech: string, lead: LeadData): void {
    const lower = speech.toLowerCase();

    // Name extraction
    const namePats = [/(?:i'm|i am|this is|my name is|name's)\s+([a-z]+(?:\s+[a-z]+)?)/i, /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:here|calling)/i];
    for (const pat of namePats) {
        const m = speech.match(pat);
        if (m && !lead.name) { lead.name = m[1]; break; }
    }

    // Need extraction
    const needKeywords: Record<string, string> = {
        "appointment": "appointment", "schedule": "appointment", "book": "appointment",
        "price": "pricing_inquiry", "cost": "pricing_inquiry", "how much": "pricing_inquiry",
        "emergency": "emergency", "urgent": "emergency", "broken": "emergency",
        "question": "general_inquiry", "information": "general_inquiry", "hours": "hours_inquiry",
    };
    for (const [kw, need] of Object.entries(needKeywords)) {
        if (lower.includes(kw) && !lead.need) { lead.need = need; break; }
    }

    // Email extraction
    const emailMatch = speech.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch && !lead.email) lead.email = emailMatch[0];
}

// ── Capture Lead to Supabase ───────────────────────────────────────────────────

async function captureCallLead(
    leadData: LeadData,
    callSid: string,
    lastSpeech: string,
    turns?: { role: string; content: string }[]
): Promise<void> {
    if (leadData.captured) return;
    leadData.captured = true;

    try {
        const transcript = turns?.map(t => `${t.role === "user" ? "CALLER" : "ARIA"}: ${t.content}`).join("\n") || lastSpeech;

        await fetch(`${APP_URL}/api/leads`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                phone: leadData.phone,
                name: leadData.name || "Unknown Caller",
                email: leadData.email,
                source: "phone_call",
                agent: "Aria",
                notes: `AI Call — Need: ${leadData.need || "general"}\nCallSid: ${callSid}\n\n${transcript}`,
                priority: leadData.need === "emergency" ? "urgent" : "normal",
                metadata: { callSid, leadData },
            }),
        }).catch(err => console.error("[Aria] Lead capture failed:", err));

        // Also send SMS to business owner alerting them
        if (leadData.phone && leadData.phone !== "Unknown") {
            console.log(`[Aria] 📋 Lead captured: ${leadData.name || "Unknown"} (${leadData.phone}) — Need: ${leadData.need || "general"}`);
        }
    } catch (err) {
        console.error("[Aria RESPOND] captureCallLead error:", err);
    }
}

// ── Fallback Response (no Gemini) ──────────────────────────────────────────────

function generateFallbackResponse(speech: string, turnCount: number, lead: LeadData): string {
    const lower = speech.toLowerCase();

    if (turnCount === 1) {
        if (lower.includes("appointment") || lower.includes("schedule") || lower.includes("book")) {
            return `Of course! I'd be happy to help schedule that. Can I get your name and a good callback number?`;
        }
        if (lower.includes("price") || lower.includes("cost") || lower.includes("how much")) {
            return `Great question! I want to make sure you get the right information. Can I get your name so I can have someone reach out with our current pricing?`;
        }
        if (lower.includes("emergency") || lower.includes("urgent") || lower.includes("broken")) {
            return `I understand this is urgent. Let me flag this right away. Can I get your name and location so our team can reach you immediately?`;
        }
        return `I hear you. I want to make sure we get you the right help. Can I get your name and best callback number?`;
    }

    if (lower.includes("yes") || lower.includes("sure") || lower.includes("okay")) {
        return `Perfect! I've got that noted${lead.name ? `, ${lead.name}` : ""}. Our team will follow up shortly. Is there anything else I can help with today?`;
    }

    if (turnCount >= 4) {
        return `I've captured everything${lead.name ? `, ${lead.name}` : ""}. Our team will be in touch very soon. Thank you for calling, and have a wonderful day!`;
    }

    return `Got it. I've noted that for you. Can I also get your best email or callback number so our team can follow up?`;
}

function escapeXml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}
