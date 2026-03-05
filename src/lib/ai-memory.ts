// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX — AI MEMORY ENGINE (SENTIENT KNOWLEDGE STORE)
// Uses Supabase pgvector for semantic memory & retrieval
// ═══════════════════════════════════════════════════════════════════
//
// This is the "brain" that makes agents LEARN and REMEMBER.
// Stores knowledge as embeddings in the expert_knowledge table
// and retrieves relevant context for each conversation.
//
// Uses Gemini for generating embeddings (768-dim) or adapts
// to the 1536-dim schema the user set up for OpenAI compatibility.
//
// ═══════════════════════════════════════════════════════════════════

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ── Types ──────────────────────────────────────────────────────

export interface KnowledgeEntry {
    id?: string;
    content: string;
    embedding?: number[];
    metadata?: Record<string, unknown>;
    created_at?: string;
}

export interface MemoryEntry {
    id?: string;
    agent_name: string;
    session_id: string;
    memory_type: "conversation" | "learning" | "objection" | "success_pattern" | "pain_point";
    content: string;
    importance: number; // 0-1
    embedding?: number[];
    metadata?: Record<string, unknown>;
    created_at?: string;
    expires_at?: string | null;
}

export interface RetrievedMemory {
    content: string;
    similarity: number;
    metadata?: Record<string, unknown>;
    created_at: string;
}

// ── Get Supabase Client ────────────────────────────────────────

function getSupabase(): SupabaseClient | null {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.warn("⚠️ Supabase not configured for AI Memory");
        return null;
    }

    return createClient(url, key, {
        auth: { persistSession: false },
    });
}

// ── Generate Embedding via Gemini ──────────────────────────────

async function generateEmbedding(text: string): Promise<number[] | null> {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("⚠️ No Gemini API key for embeddings");
        return null;
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "models/text-embedding-004",
                    content: { parts: [{ text }] },
                    taskType: "RETRIEVAL_DOCUMENT",
                }),
            }
        );

        if (!response.ok) {
            console.error("Embedding API error:", response.status, await response.text());
            return null;
        }

        const data = await response.json();
        const embedding = data.embedding?.values;

        if (!embedding) {
            console.error("No embedding returned");
            return null;
        }

        // Gemini text-embedding-004 returns 768 dims
        // If the DB expects 1536 (OpenAI), pad with zeros
        if (embedding.length < 1536) {
            return [...embedding, ...new Array(1536 - embedding.length).fill(0)];
        }

        return embedding;
    } catch (error) {
        console.error("❌ Embedding generation error:", error);
        return null;
    }
}

// ══════════════════════════════════════════════════════════════
// EXPERT KNOWLEDGE — Long-term knowledge store
// ══════════════════════════════════════════════════════════════

export async function storeKnowledge(content: string, metadata?: Record<string, unknown>): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    const embedding = await generateEmbedding(content);

    const { error } = await supabase
        .from("expert_knowledge")
        .insert({
            content,
            embedding,
            metadata: metadata || {},
        });

    if (error) {
        console.error("❌ Failed to store knowledge:", error.message);
        return false;
    }

    console.log("🧠 Knowledge stored:", content.substring(0, 60) + "...");
    return true;
}

export async function searchKnowledge(query: string, limit: number = 5): Promise<RetrievedMemory[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    const queryEmbedding = await generateEmbedding(query);

    if (!queryEmbedding) {
        // Fallback: text search
        const { data, error } = await supabase
            .from("expert_knowledge")
            .select("*")
            .textSearch("content", query.split(" ").join(" & "))
            .limit(limit);

        if (error || !data) return [];

        return data.map((d: KnowledgeEntry) => ({
            content: d.content,
            similarity: 0.5, // No vector similarity available
            metadata: d.metadata as Record<string, unknown>,
            created_at: d.created_at || new Date().toISOString(),
        }));
    }

    // Vector similarity search using pgvector
    const { data, error } = await supabase.rpc("match_expert_knowledge", {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        match_count: limit,
    });

    if (error) {
        console.error("❌ Knowledge search error:", error.message);
        // Fallback to basic query
        const { data: fallbackData } = await supabase
            .from("expert_knowledge")
            .select("*")
            .limit(limit)
            .order("created_at", { ascending: false });

        return (fallbackData || []).map((d: KnowledgeEntry) => ({
            content: d.content,
            similarity: 0.3,
            metadata: d.metadata as Record<string, unknown>,
            created_at: d.created_at || new Date().toISOString(),
        }));
    }

    return (data || []).map((d: { content: string; similarity: number; metadata: Record<string, unknown>; created_at: string }) => ({
        content: d.content,
        similarity: d.similarity,
        metadata: d.metadata,
        created_at: d.created_at,
    }));
}

// ══════════════════════════════════════════════════════════════
// AGENT MEMORY — Per-agent contextual memory
// ══════════════════════════════════════════════════════════════

export async function storeMemory(memory: Omit<MemoryEntry, "id" | "created_at">): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    // Generate embedding for semantic search
    const embedding = await generateEmbedding(memory.content);

    const { error } = await supabase
        .from("agent_learnings")
        .insert({
            learning_type: memory.memory_type,
            content: memory.content,
            confidence: memory.importance,
            source_agent: memory.agent_name,
            source_session: memory.session_id,
            applied_count: 0,
        });

    if (error) {
        console.error("❌ Failed to store memory:", error.message);
        return false;
    }

    // Also store in expert_knowledge for cross-agent retrieval
    if (embedding && memory.importance >= 0.7) {
        await supabase
            .from("expert_knowledge")
            .insert({
                content: `[${memory.agent_name}] ${memory.content}`,
                embedding,
                metadata: {
                    agent: memory.agent_name,
                    type: memory.memory_type,
                    session: memory.session_id,
                    importance: memory.importance,
                },
            });
    }

    console.log(`🧠 Memory stored for ${memory.agent_name}: ${memory.content.substring(0, 50)}...`);
    return true;
}

export async function recallMemories(
    agentName: string,
    context: string,
    limit: number = 5
): Promise<RetrievedMemory[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    // Get agent-specific learnings
    const { data, error } = await supabase
        .from("agent_learnings")
        .select("*")
        .eq("source_agent", agentName)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error || !data) return [];

    return data.map((d: { content: string; confidence: number; created_at: string }) => ({
        content: d.content,
        similarity: d.confidence,
        metadata: { agent: agentName },
        created_at: d.created_at,
    }));
}

// ══════════════════════════════════════════════════════════════
// KNOWLEDGE SEEDING — Pre-populate with BioDynamX expertise
// ══════════════════════════════════════════════════════════════

export async function seedBioDynamXKnowledge(): Promise<number> {
    const coreKnowledge = [
        "BioDynamX guarantees 5x ROI within 90 days for all clients. This is backed by a performance-based model where clients only pay if we deliver results.",
        "62% of all incoming calls to small businesses go unanswered. BioDynamX AI agents answer every call within 0.4 seconds, 24/7/365.",
        "The average business loses $37,000/year to missed calls, unanswered chats, and voicemail leakage. BioDynamX eliminates this revenue leak completely.",
        "Businesses with ratings below 4.0 stars on Google lose 35% of potential customers automatically. Reputation management is a critical silent killer.",
        "The BioDynamX Challenger Sale methodology teaches prospects about problems they didn't know they had, then positions our solution as the only viable fix.",
        "SEO, AEO (Answer Engine Optimization), and GEO (Generative Engine Optimization) are the three visibility pillars. Most businesses are only optimizing for one.",
        "The BioDynamX multi-agent system uses Journey (Fear of Loss), Jenny (Diagnostician), and Mark (Technical Closer) in a orchestrated sales conversation.",
        "AI voice agents with sub-second latency create a human-like conversation experience that increases engagement by 340% compared to chatbots.",
        "The BioDynamX audit tool provides a real-time breakdown of digital presence gaps: Website SEO, Google Business Profile, Social Media, and Call Response Time.",
        "Industries with the highest ROI from BioDynamX: Dental practices ($25K/mo recovery), Law firms ($35K/mo), Medical practices ($28K/mo), HVAC ($18K/mo).",
    ];

    let stored = 0;
    for (const knowledge of coreKnowledge) {
        const success = await storeKnowledge(knowledge, {
            source: "seed",
            category: "core_knowledge",
        });
        if (success) stored++;
    }

    console.log(`🌱 Seeded ${stored}/${coreKnowledge.length} knowledge entries`);
    return stored;
}

// ══════════════════════════════════════════════════════════════
// CONTEXT BUILDER — Build agent context from memory
// ══════════════════════════════════════════════════════════════

export async function buildAgentContext(
    agentName: string,
    currentConversation: string
): Promise<string> {
    const [agentMemories, relevantKnowledge] = await Promise.all([
        recallMemories(agentName, currentConversation, 5),
        searchKnowledge(currentConversation, 3),
    ]);

    let context = "";

    if (relevantKnowledge.length > 0) {
        context += "\n═══ RELEVANT KNOWLEDGE ═══\n";
        relevantKnowledge.forEach(k => {
            context += `• ${k.content}\n`;
        });
    }

    if (agentMemories.length > 0) {
        context += "\n═══ YOUR PAST LEARNINGS ═══\n";
        agentMemories.forEach(m => {
            context += `• ${m.content}\n`;
        });
    }

    return context;
}
