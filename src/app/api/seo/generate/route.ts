import { NextRequest, NextResponse } from "next/server";
import { getIronclawSEOAgent } from "@/lib/seo-domination-agent";

// ═══════════════════════════════════════════════════════════════════
// /api/seo/generate — Autonomous Content Generation Engine
// ═══════════════════════════════════════════════════════════════════
// This is the FULLY AUTONOMOUS content pipeline.
// The agent generates production-ready SEO articles using Gemini,
// formats them with atomic answers, schema, and internal links,
// and returns them ready to publish.
//
// Endpoints:
//   POST /api/seo/generate                → Generate next priority content
//   POST /api/seo/generate { id: "..." }  → Generate specific content piece
// ═══════════════════════════════════════════════════════════════════

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
const GEMINI_TEXT_MODEL = "gemini-2.5-flash";
const GEMINI_TEXT_API = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(req: NextRequest) {
    const agent = getIronclawSEOAgent();

    try {
        const body = await req.json().catch(() => ({}));
        const contentId = body.id || null;

        // Get the content brief — either specific or next priority
        let brief;
        if (contentId) {
            const plan = agent.getContentPlan();
            const piece = plan.find(p => p.id === contentId);
            if (!piece) {
                return NextResponse.json({ success: false, error: `Content piece "${contentId}" not found` }, { status: 404 });
            }
            // Generate brief for this specific piece
            const keywords = agent.getKeywords().filter(k => piece.targetKeywords.includes(k.keyword));
            const totalVolume = keywords.reduce((sum, k) => sum + (k.searchVolume || 0), 0);
            brief = {
                ...piece,
                brief: `Title: ${piece.title}\nSlug: /${piece.slug}\nKeywords: ${piece.targetKeywords.join(", ")}\nVolume: ${totalVolume}\nAtomic Answers: ${piece.atomicAnswers.join("\n")}\nInternal Links: ${piece.internalLinks.join(", ")}`,
            };
        } else {
            brief = agent.getNextContentBrief();
        }

        if (!brief) {
            return NextResponse.json({
                success: true,
                message: "All content pieces are published or drafted. No generation needed.",
            });
        }

        if (!GEMINI_API_KEY) {
            return NextResponse.json({
                success: false,
                error: "GEMINI_API_KEY is not configured. Cannot generate content.",
            }, { status: 500 });
        }

        console.log(`[SEO Agent] 🤖 Autonomously generating: "${brief.title}"`);

        // ═══ BUILD THE MASTER PROMPT ═══
        const systemPrompt = buildContentPrompt(brief);

        // ═══ CALL GEMINI FOR CONTENT GENERATION ═══
        const geminiResponse = await fetch(GEMINI_TEXT_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: systemPrompt }],
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 8192,
                    topP: 0.9,
                },
            }),
        });

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            console.error("[SEO Agent] Gemini API error:", errorText);
            return NextResponse.json({
                success: false,
                error: `Gemini API returned ${geminiResponse.status}: ${errorText.substring(0, 200)}`,
            }, { status: 500 });
        }

        const geminiData = await geminiResponse.json();
        const generatedContent = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        if (!generatedContent) {
            return NextResponse.json({
                success: false,
                error: "Gemini returned empty content",
            }, { status: 500 });
        }

        // ═══ GENERATE SCHEMA ═══
        const schema = agent.generateSchema(brief);

        // ═══ GENERATE FAQ SCHEMA ═══
        const faqSchema = buildFAQSchema(brief, generatedContent);

        console.log(`[SEO Agent] ✅ Generated ${generatedContent.length} characters for "${brief.title}"`);

        return NextResponse.json({
            success: true,
            agent: agent.getAgentId(),
            content: {
                id: brief.id,
                title: brief.title,
                slug: brief.slug,
                type: brief.type,
                targetKeywords: brief.targetKeywords,
                atomicAnswers: brief.atomicAnswers,
                internalLinks: brief.internalLinks,
                generatedArticle: generatedContent,
                schema: schema,
                faqSchema: faqSchema,
                wordCount: generatedContent.split(/\s+/).length,
                generatedAt: new Date().toISOString(),
                readyToPublish: true,
            },
            nextSteps: [
                "1. Review the generated article for accuracy",
                "2. Create the Next.js page at src/app/" + brief.slug + "/page.tsx",
                "3. Add the JSON-LD schema to the page head",
                "4. Deploy with 'firebase deploy --only hosting'",
                "5. Hit /api/seo?action=index to submit to search engines",
            ],
        });

    } catch (err) {
        console.error("[SEO Agent] Generation error:", err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

// ═══ CONTENT GENERATION PROMPT BUILDER ═══

function buildContentPrompt(brief: {
    title: string;
    slug: string;
    type: string;
    targetKeywords: string[];
    atomicAnswers: string[];
    internalLinks: string[];
    schemaType: string;
}): string {
    return `You are the Ironclaw SEO Domination Agent — an elite content strategist and writer built by BioDynamX Engineering Group. Your mission is to generate a full, production-ready SEO article that will rank #1 on Google and get cited by AI systems like ChatGPT, Gemini, and Perplexity.

═══ CONTENT BRIEF ═══
Title: ${brief.title}
URL: https://biodynamx.com/${brief.slug}
Content Type: ${brief.type}
Schema Type: ${brief.schemaType}

═══ TARGET KEYWORDS (Must appear naturally throughout) ═══
${brief.targetKeywords.map(k => `• "${k}"`).join("\n")}

═══ ATOMIC ANSWERS (Front-load these in the first 200 words — they MUST be extractable by AI systems) ═══
${brief.atomicAnswers.map((a, i) => `${i + 1}. ${a}`).join("\n\n")}

═══ INTERNAL LINKS (Weave these naturally into the content) ═══
${brief.internalLinks.map(l => `• https://biodynamx.com${l}`).join("\n")}

═══ WRITING RULES (NON-NEGOTIABLE) ═══

1. LENGTH: 2,000-3,000 words. Deep, comprehensive, authoritative.

2. STRUCTURE:
   - Begin with a direct atomic answer block (40-75 words) that answers the page's core question
   - Use question-based H2 and H3 headings that mirror how people ask AI systems (e.g., "How Do AI Voice Agents Work?" not "AI Voice Agent Technology")
   - Every heading must have a self-contained answer underneath (35-45 words) before expanding
   - Use bullet points, numbered lists, and comparison tables extensively
   - End with a FAQ section (5+ questions with concise answers)

3. TONE:
   - Write as Billy De La Taurus, Founder & Chief Architect of BioDynamX
   - Confident, authoritative, backed by data
   - 8th-grade reading level — no jargon without definitions
   - Convert qualitative claims to quantitative ones (use specific numbers)

4. DATA & PROOF:
   - Include at least 5 specific statistics (response times, cost comparisons, ROI numbers)
   - Reference real industry data (missed call rates, average response times, conversion rates)
   - Use dollar amounts to anchor value: "$18,000/mo in lost revenue" not "lots of lost revenue"

5. BRAND VOICE:
   - BioDynamX is PRONOUNCED "Bio Dynamics" — never say the X
   - We don't just automate — we engineer the neurobiology of choice
   - 85% of buying decisions happen subconsciously — we target that
   - Web 4.0 = Ambient Intelligence. We don't install bots; we build custom software that lives everywhere.
   - Growth Engine = $497/mo, Enterprise Suite = $1,497/mo
   - Jenny = our AI voice agent, Mark = our technical architect
   - 0.4 seconds = our average response time

6. CTA (Call To Action):
   - Include 2-3 CTAs woven naturally into the content
   - Primary CTA: "Talk to Jenny — our AI runs a live diagnostic on your business in 60 seconds"
   - Secondary CTA: "Get your free revenue audit" (link to /audit)

7. SEO RULES:
   - Primary keyword must appear in the first paragraph, first H2, and last paragraph
   - Secondary keywords should appear 2-3 times each, naturally
   - Do NOT keyword stuff — Google penalizes this
   - Every paragraph must be self-contained (can be understood without surrounding context)
   - No transition phrases like "as mentioned above" — AI systems extract paragraphs independently

8. E-E-A-T SIGNALS:
   - Mention the author (Billy De La Taurus) with credentials
   - Include a "Last Updated: March 2026" reference
   - Reference specific customer outcomes (even hypothetical but realistic examples)
   - Link to authoritative sources where appropriate

9. FORMAT:
   - Output in clean Markdown format
   - Use ## for H2, ### for H3
   - Use **bold** for key terms
   - Use tables for comparisons (Markdown table syntax)
   - Use > blockquotes for key statistics or quotes

Now generate the complete article. Make it the best piece of content on the internet for these keywords.`;
}

// ═══ FAQ SCHEMA BUILDER ═══

function buildFAQSchema(
    brief: { title: string; slug: string; targetKeywords: string[] },
    content: string
): Record<string, unknown> {
    // Extract Q&A pairs from the generated content (look for ### patterns followed by answers)
    const faqRegex = /###\s*(.+?)\n\n([^#]+?)(?=\n##|\n###|$)/g;
    const faqs: Array<{ question: string; answer: string }> = [];

    let match;
    while ((match = faqRegex.exec(content)) !== null && faqs.length < 8) {
        const question = match[1].trim().replace(/\*\*/g, "");
        const answer = match[2].trim().substring(0, 300).replace(/\*\*/g, ""); // Max 300 chars for schema
        if (question.includes("?") || question.toLowerCase().startsWith("how") || question.toLowerCase().startsWith("what")) {
            faqs.push({ question, answer });
        }
    }

    // If no FAQs extracted from content, generate from keywords
    if (faqs.length === 0) {
        for (const kw of brief.targetKeywords.slice(0, 5)) {
            faqs.push({
                question: `What is ${kw}?`,
                answer: `${kw} is a key capability offered by BioDynamX Engineering Group. Visit https://biodynamx.com/${brief.slug} for comprehensive details.`,
            });
        }
    }

    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer,
            },
        })),
    };
}

// Also support GET for status
export async function GET() {
    const agent = getIronclawSEOAgent();
    const brief = agent.getNextContentBrief();

    return NextResponse.json({
        success: true,
        agent: agent.getAgentId(),
        autonomous: true,
        nextContentToGenerate: brief ? {
            id: brief.id,
            title: brief.title,
            slug: brief.slug,
            targetKeywords: brief.targetKeywords,
        } : null,
        usage: {
            generateNext: "POST /api/seo/generate (no body needed — auto-picks highest priority)",
            generateSpecific: 'POST /api/seo/generate { "id": "pillar-ai-voice-agents" }',
            availableIds: agent.getContentPlan()
                .filter(c => c.status === "planned" || c.status === "needs_update")
                .map(c => ({ id: c.id, title: c.title, status: c.status })),
        },
    });
}
