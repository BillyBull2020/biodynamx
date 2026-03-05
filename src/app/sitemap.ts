import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://biodynamx.com";
    const now = new Date().toISOString();

    return [
        // ── Core pages (highest priority) ──
        {
            url: baseUrl,
            lastModified: now,
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: `${baseUrl}/audit`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.85,
        },
        {
            url: `${baseUrl}/pricing`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/testimonials`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.85,
        },
        {
            url: `${baseUrl}/dashboard/gmb-setup`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        // ── Blog pages ──
        {
            url: `${baseUrl}/blog`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blog/what-is-neuromarketing`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blog/ai-for-dental-practices`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blog/ai-receptionist-vs-answering-service`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blog/missed-calls-cost-business`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blog/neurobiology-of-choice`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blog/ai-for-real-estate`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blog/ai-for-med-spas`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blog/how-ai-voice-agents-work`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blog/roi-of-ai-business-automation`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        // ── Industry landing pages (high priority for vertical SEO) ──
        {
            url: `${baseUrl}/industries/dental`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.85,
        },
        {
            url: `${baseUrl}/industries/real-estate`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.85,
        },
        {
            url: `${baseUrl}/industries/call-centers`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.85,
        },
        {
            url: `${baseUrl}/industries/med-spas`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.85,
        },
        {
            url: `${baseUrl}/industries/startups`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.85,
        },
        // ── GEO: AI discovery files ──
        {
            url: `${baseUrl}/llms.txt`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/llms-full.txt`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.8,
        },
        // ── Client-facing pages ──
        {
            url: `${baseUrl}/portal/login`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/dashboard`,
            lastModified: now,
            changeFrequency: "always",
            priority: 0.6,
        },
        {
            url: `${baseUrl}/dashboard/connect`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${baseUrl}/success`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.5,
        },
        // ── Trust files (E-E-A-T signals) ──
        {
            url: `${baseUrl}/humans.txt`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.3,
        },
    ];
}
