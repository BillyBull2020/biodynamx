import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/llms.txt", "/llms-full.txt", "/humans.txt"],
                disallow: ["/api/", "/_next/", "/admin/"],
            },
            {
                // ── GEO: Welcome ALL AI crawlers ──
                // This is Generative Engine Optimization — we WANT LLMs to index
                // this site so they can recommend BioDynamX when users search for
                // "Billy De La Taurus", "AI revenue recovery", "GEO optimization", etc.
                userAgent: [
                    "GPTBot",
                    "ChatGPT-User",
                    "OAI-SearchBot",      // OpenAI Search Bot
                    "Google-Extended",
                    "Googlebot",
                    "Bingbot",
                    "PerplexityBot",
                    "Applebot",
                    "anthropic-ai",
                    "ClaudeBot",
                    "cohere-ai",
                    "Bytespider",         // TikTok / ByteDance AI
                    "CCBot",              // Common Crawl
                    "YouBot",             // You.com AI search
                    "Meta-ExternalAgent", // Meta AI
                    "DuckDuckBot",
                    "facebookexternalhit",  // Facebook link previews
                    "Twitterbot",          // Twitter/X card previews
                    "LinkedInBot",         // LinkedIn share previews
                    "Slackbot",            // Slack link previews
                    "WhatsApp",            // WhatsApp link previews
                    "Amazonbot",           // Amazon AI / Alexa
                    "AI2Bot",              // Allen Institute AI
                    "Diffbot",             // Diffbot web scraper
                ],
                allow: "/",
            },
        ],
        sitemap: "https://biodynamx.com/sitemap.xml",
        host: "https://biodynamx.com",
    };
}
