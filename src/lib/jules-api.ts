// ============================================================================
// Jules API Client — BioDynamX Integration
// ============================================================================
// Proper integration with Google's Jules AI Agent API (v1alpha)
// Endpoint: https://jules.googleapis.com/v1alpha
//
// Core concepts:
//   Source  — A GitHub repository connected through the Jules web UI
//   Session — A continuous unit of work (task) given to Jules
//   Activity — Individual steps within a session (plan, code, message)
//
// Auth: x-goog-api-key header (API key from Jules settings)
// ============================================================================

const JULES_BASE_URL = "https://jules.googleapis.com/v1alpha";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface JulesSource {
    name: string;                // Resource name: sources/{source_id}
    displayName: string;
    repositoryUrl: string;
    defaultBranch: string;
    state: "ACTIVE" | "INACTIVE" | "PENDING" | string;
}

export interface JulesSourceContext {
    source: string;              // Resource name of the source
    startingBranch?: string;     // Branch to start from (defaults to default branch)
}

export interface JulesSession {
    name: string;                // Resource name: sessions/{session_id}
    title: string;
    prompt: string;
    state: "ACTIVE" | "COMPLETED" | "FAILED" | "CANCELLED" | string;
    sourceContext?: JulesSourceContext;
    automationMode?: "AUTO_CREATE_PR" | "MANUAL" | string;
    createTime: string;
    updateTime: string;
}

export interface JulesActivity {
    name: string;                // Resource name: sessions/{session}/activities/{activity}
    type: "USER_MESSAGE" | "AGENT_MESSAGE" | "PLAN" | "CODE_CHANGE" | "STATUS_UPDATE" | string;
    content: string;
    createTime: string;
}

export interface JulesListResponse<T> {
    items: T[];
    nextPageToken?: string;
    totalSize?: number;
}

export interface JulesError {
    code: number;
    message: string;
    status: string;
}

// ─── Client Class ─────────────────────────────────────────────────────────

export class JulesClient {
    private apiKey: string;

    constructor(apiKey: string) {
        if (!apiKey) throw new Error("Jules API key required");
        this.apiKey = apiKey;
    }

    // ── Sources ──────────────────────────────────────────────────

    /** List all connected GitHub repositories */
    async listSources(pageSize = 30): Promise<JulesSource[]> {
        const res = await this.request<{ sources?: JulesSource[] }>("GET", `/sources?pageSize=${pageSize}`);
        return res.sources || [];
    }

    /** Get a specific source by resource name */
    async getSource(name: string): Promise<JulesSource> {
        return this.request<JulesSource>("GET", `/${name}`);
    }

    // ── Sessions ─────────────────────────────────────────────────

    /** Create a new Jules session (task) */
    async createSession(params: {
        prompt: string;
        title?: string;
        sourceContext?: JulesSourceContext;
        automationMode?: "AUTO_CREATE_PR" | "MANUAL";
    }): Promise<JulesSession> {
        const body: Record<string, unknown> = {
            prompt: params.prompt,
        };

        if (params.title) body.title = params.title;
        if (params.sourceContext) body.sourceContext = params.sourceContext;
        if (params.automationMode) body.automationMode = params.automationMode;

        return this.request<JulesSession>("POST", "/sessions", body);
    }

    /** List sessions (paginated) */
    async listSessions(pageSize = 30, pageToken?: string): Promise<JulesListResponse<JulesSession>> {
        let endpoint = `/sessions?pageSize=${pageSize}`;
        if (pageToken) endpoint += `&pageToken=${pageToken}`;

        const res = await this.request<{ sessions?: JulesSession[]; nextPageToken?: string }>("GET", endpoint);
        return {
            items: res.sessions || [],
            nextPageToken: res.nextPageToken,
        };
    }

    /** Get a specific session */
    async getSession(sessionId: string): Promise<JulesSession> {
        const name = sessionId.startsWith("sessions/") ? sessionId : `sessions/${sessionId}`;
        return this.request<JulesSession>("GET", `/${name}`);
    }

    /** Send a message (activity) to a session */
    async sendMessage(sessionId: string, message: string): Promise<JulesActivity> {
        const parent = sessionId.startsWith("sessions/") ? sessionId : `sessions/${sessionId}`;
        return this.request<JulesActivity>("POST", `/${parent}/activities`, {
            type: "USER_MESSAGE",
            content: message,
        });
    }

    // ── Activities ────────────────────────────────────────────────

    /** List activities for a session */
    async listActivities(sessionId: string, pageSize = 30): Promise<JulesActivity[]> {
        const parent = sessionId.startsWith("sessions/") ? sessionId : `sessions/${sessionId}`;
        const res = await this.request<{ activities?: JulesActivity[] }>("GET", `/${parent}/activities?pageSize=${pageSize}`);
        return res.activities || [];
    }

    /** Get a specific activity */
    async getActivity(sessionId: string, activityId: string): Promise<JulesActivity> {
        const parent = sessionId.startsWith("sessions/") ? sessionId : `sessions/${sessionId}`;
        const name = activityId.startsWith("activities/") ? activityId : `activities/${activityId}`;
        return this.request<JulesActivity>("GET", `/${parent}/${name}`);
    }

    // ── Health Check ─────────────────────────────────────────────

    /** Quick health check — lists sources to verify API key works */
    async healthCheck(): Promise<{ healthy: boolean; sources: number; message: string }> {
        try {
            const sources = await this.listSources(1);
            return {
                healthy: true,
                sources: sources.length,
                message: `Jules API connected. ${sources.length} source(s) available.`,
            };
        } catch (err) {
            return {
                healthy: false,
                sources: 0,
                message: `Jules API error: ${err instanceof Error ? err.message : String(err)}`,
            };
        }
    }

    // ── Private Helper ────────────────────────────────────────────

    private async request<T>(method: string, path: string, body?: Record<string, unknown>): Promise<T> {
        const url = `${JULES_BASE_URL}${path}`;

        console.log(`[Jules API] ${method} ${url}`);

        const headers: Record<string, string> = {
            "x-goog-api-key": this.apiKey,
            "Content-Type": "application/json",
        };

        const options: RequestInit = {
            method,
            headers,
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            try {
                const errorBody = await response.json();
                if (errorBody.error) {
                    const err = errorBody.error as JulesError;
                    errorMessage = `[${err.status || response.status}] ${err.message || errorMessage}`;
                }
            } catch {
                // Use the default error message
            }
            console.error(`[Jules API] ❌ ${errorMessage}`);
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log(`[Jules API] ✅ ${method} ${path} — OK`);
        return data as T;
    }
}

// ─── Singleton Instance ───────────────────────────────────────────────────

let _instance: JulesClient | null = null;

export function getJulesClient(): JulesClient | null {
    if (_instance) return _instance;

    const apiKey = process.env.STITCH_API_KEY || process.env.JULES_API_KEY;
    if (!apiKey || apiKey === "your_jules_api_key_here") {
        console.warn("[Jules] ⚠️ No API key configured. Set STITCH_API_KEY or JULES_API_KEY in .env.local");
        return null;
    }

    _instance = new JulesClient(apiKey);
    return _instance;
}

// ─── BioDynamX-Specific Session Templates ──────────────────────────────────

/** Create a deployment/automation session for a BioDynamX client */
export async function createBioDynamXSession(params: {
    clientName: string;
    clientDomain: string;
    auditData?: Record<string, unknown>;
    taskType: "full_deployment" | "audit_fix" | "design_implement" | "jules_qa_inspection" | "custom";
    customPrompt?: string;
    sourceResourceName?: string;
}): Promise<JulesSession | null> {
    const client = getJulesClient();
    if (!client) {
        console.warn("[Jules] Cannot create session — no API key");
        return null;
    }

    const promptTemplates: Record<string, string> = {
        full_deployment: `## BioDynamX Full Deployment — ${params.clientName}

Deploy the complete BioDynamX AI Revenue Recovery Engine for ${params.clientName} (${params.clientDomain}):

1. **AI Receptionist (Aria)** — Configure 0.4s call answering for ${params.clientDomain}
2. **Lead Nurture System** — Set up 8-second SMS/email follow-up sequences
3. **SEO + AEO + GEO Optimization** — Implement Schema.org markup, FAQ schema, and AI citation optimization
4. **Reputation Manager** — Auto-monitor and respond to Google reviews
5. **Revenue Dashboard** — Deploy real-time revenue leak tracking

${params.auditData ? `### Audit Findings\n${JSON.stringify(params.auditData, null, 2)}` : ""}

Priority: Fix the highest-impact revenue leaks first. Deploy MVP within 48 hours.`,

        audit_fix: `## Fix Audit Findings — ${params.clientName} (${params.clientDomain})

Based on our 20-probe diagnostic, implement the following fixes:

${params.auditData ? JSON.stringify(params.auditData, null, 2) : "Run a fresh audit and fix all findings."}

Focus on:
- SEO/AEO/GEO gaps
- Missing Schema.org structured data
- Mobile responsiveness issues
- Content quality improvements
- CTA optimization`,

        design_implement: `## Design & Implement — ${params.clientName}

Create a high-fidelity, conversion-optimized landing page for ${params.clientDomain} using BioDynamX persuasive design principles:

- Neurobiology of Choice frameworks
- Loss aversion headlines
- Social proof sections
- FOMO scarcity elements
- AI agent integration (Jenny & Mark voice CTA)
- Stripe checkout integration

${params.auditData ? `### Current Site Analysis\n${JSON.stringify(params.auditData, null, 2)}` : ""}`,

        jules_qa_inspection: `## 🔍 Jules QA Final Inspection — ${params.clientName} (${params.clientDomain})

You are the FINAL quality gate before this website goes live. Perform an exhaustive inspection and fix EVERY issue you find.

### 1. SEO & Structured Data
- Verify Schema.org JSON-LD (Organization, LocalBusiness, FAQPage, HowTo, Product)
- Check all pages have unique <title>, <meta description>, canonical URLs
- Verify OpenGraph and Twitter Card meta tags
- Check robots.txt and sitemap.xml exist and are valid
- Verify heading hierarchy (single H1 per page)
- Ensure all images have alt attributes

### 2. Performance & Core Web Vitals
- Check for render-blocking resources
- Verify images are optimized (WebP, lazy loading)
- Check CSS/JS bundle sizes
- Verify animations use GPU compositing (transform, opacity)
- Check for layout shifts (CLS)
- Verify fonts are preloaded

### 3. Security
- No API keys or secrets in client-side code
- NEXT_PUBLIC_ variables are safe (only public keys)
- Server-side routes don't expose sensitive data
- Input validation on all API endpoints
- CORS headers configured correctly

### 4. Accessibility (WCAG 2.1 AA)
- All interactive elements have aria-labels
- Color contrast meets 4.5:1 minimum
- Keyboard navigation works
- Form inputs have associated labels
- Focus indicators visible

### 5. Conversion Optimization (Neurobiology of Choice)
- CTAs are visible above the fold
- Social proof elements present
- Scarcity/urgency triggers active
- Trust badges (guarantee, testimonials) visible
- Friction reducers near checkout (no-risk messaging)
- Mobile CTAs are thumb-friendly

### 6. Mobile Responsiveness
- All pages render correctly at 375px, 768px, 1024px, 1440px
- Navigation works on mobile
- Touch targets are at least 44x44px
- No horizontal scrolling
- Text is readable without zooming

### 7. Functional Testing
- All links work (no 404s)
- Forms submit correctly
- API integrations respond (Gemini, Stripe, Twilio, etc.)
- Voice agent CTA triggers properly
- Checkout flow completes

${params.auditData ? `### Previous Audit Data\n${JSON.stringify(params.auditData, null, 2)}` : ""}

**IMPORTANT:** Fix every issue you find. This is the last step before going live. The client is paying for perfection.`,

        custom: params.customPrompt || `Custom task for ${params.clientName} at ${params.clientDomain}`,
    };

    const prompt = promptTemplates[params.taskType];
    const title = `BioDynamX — ${params.taskType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())} — ${params.clientName}`;

    try {
        const sessionParams: Parameters<JulesClient["createSession"]>[0] = {
            prompt,
            title,
        };

        // Attach source context if a GitHub repo is specified
        if (params.sourceResourceName) {
            sessionParams.sourceContext = {
                source: params.sourceResourceName,
            };
            sessionParams.automationMode = "AUTO_CREATE_PR";
        }

        const session = await client.createSession(sessionParams);

        console.log(`[Jules] ✅ Session created: ${session.name}`);
        console.log(`[Jules] 🔗 https://jules.google.com/session/${session.name?.replace("sessions/", "")}`);

        return session;
    } catch (err) {
        console.error("[Jules] Failed to create session:", err);
        return null;
    }
}

// ─── Jules QA Inspection — Final Quality Gate ──────────────────────────────

/** Run Jules QA inspection as the final step after website build/deploy */
export async function runJulesQAInspection(params: {
    clientName: string;
    clientDomain: string;
    repoUrl?: string;
    auditData?: Record<string, unknown>;
    sourceResourceName?: string;
}): Promise<{ session: JulesSession | null; url: string | null }> {
    console.log(`[Jules QA] 🔍 Starting final inspection for ${params.clientName} (${params.clientDomain})`);

    const session = await createBioDynamXSession({
        clientName: params.clientName,
        clientDomain: params.clientDomain,
        auditData: params.auditData,
        taskType: "jules_qa_inspection",
        sourceResourceName: params.sourceResourceName,
    });

    if (!session) {
        console.error("[Jules QA] ❌ Failed to create QA session");
        return { session: null, url: null };
    }

    const sessionId = session.name?.replace("sessions/", "") || "";
    const url = `https://jules.google.com/session/${sessionId}`;

    console.log(`[Jules QA] ✅ QA session live: ${url}`);
    console.log(`[Jules QA] 📋 Jules is performing 7-point inspection for ${params.clientName}`);

    return { session, url };
}

