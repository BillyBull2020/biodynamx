"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";

// ─── Scroll-Reveal Hook ──────────────────────────────────────────
function useScrollReveal(threshold = 0.15) {
    const [isVisible, setIsVisible] = useState(false);
    const [element, setElement] = useState<HTMLDivElement | null>(null);
    const ref = useCallback((node: HTMLDivElement | null) => {
        setElement(node);
    }, []);
    useEffect(() => {
        if (!element) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); obs.unobserve(element); } },
            { threshold }
        );
        obs.observe(element);
        return () => obs.disconnect();
    }, [element, threshold]);
    return [ref, isVisible] as const;
}

// ─── Glossary Data ───────────────────────────────────────────────
const GLOSSARY: Record<string, { term: string; def: string }[]> = {
    A: [
        { term: "A/B Testing", def: "A method of comparing two versions of a webpage or ad to see which triggers a stronger subconscious \"click\" response." },
        { term: "Algorithm", def: "The mathematical set of rules used by search engines to rank content; we optimize to align these rules with human biology." },
        { term: "Analytics", def: "The process of collecting and interpreting data to understand the \"Why\" behind customer behavior." },
        { term: "Amygdala Hijack", def: "A marketing term for a strategy that triggers a sudden, strong emotional reaction (like urgency) that bypasses the rational brain." },
        { term: "Artificial Intelligence (AI)", def: "Technology that mimics human neural patterns to perform tasks like learning, reasoning, and problem-solving." },
        { term: "Audience Segmentation", def: "Dividing a target audience into groups based on shared neural triggers, demographics, or behaviors." },
        { term: "Automation", def: "Using technology to perform repetitive marketing tasks with minimal human intervention, ensuring consistent brand touchpoints." },
    ],
    B: [
        { term: "Backlink", def: "A link from an external website to yours, acting as \"social proof\" that tells search engines your site is an authority." },
        { term: "Basal Ganglia (Reptilian Brain)", def: "The oldest part of the human brain. It controls habits and instincts. Effective marketing speaks to this area first to trigger \"buy\" signals." },
        { term: "Biometrics", def: "The measurement of physical responses (like eye-tracking or heart rate) to see how a brain is reacting to a specific ad or logo." },
        { term: "Bounce Rate", def: "The percentage of visitors who leave a site after one page; usually a sign that the \"reptilian brain\" didn't find immediate value." },
        { term: "Brand Advocate", def: "A customer who promotes your brand voluntarily because they have formed an emotional, neural connection with your values." },
        { term: "Brand Authenticity", def: "How genuine and transparent a brand is. Authenticity lowers the \"skepticism\" response in a customer's prefrontal cortex." },
        { term: "Brand Awareness", def: "The extent to which consumers recognize and recall your brand when a specific need arises." },
        { term: "Brand Style Guide", def: "A document ensuring visual and verbal consistency, which helps the brain recognize your brand \"pattern\" instantly." },
        { term: "Business Objective", def: "A specific, measurable goal set to achieve desired outcomes within a defined timeframe." },
        { term: "Buyer Persona", def: "A semi-fictional profile of your ideal customer based on psychological data and real-world behavior." },
    ],
    C: [
        { term: "Call to Action (CTA)", def: "A prompt (like \"Get Started\") that encourages a user to take a specific step by reducing \"decision friction.\"" },
        { term: "Carousel Ads", def: "An ad format allowing users to swipe through multiple images, engaging the brain's visual-spatial processing." },
        { term: "Character Count", def: "The total number of letters and spaces in a text, crucial for optimizing for the brain's limited attention span." },
        { term: "Chatbot", def: "Software that simulates human conversation, providing the \"instant gratification\" the reptilian brain craves." },
        { term: "Click-Through Rate (CTR)", def: "The percentage of people who click a link after seeing it, measuring the \"hook\" effectiveness of your copy." },
        { term: "Clickbait", def: "Content designed to attract clicks via sensationalism; while it gets clicks, it often damages brand \"Trust Signals.\"" },
        { term: "Co-marketing", def: "A partnership where two brands collaborate to share audiences and neural \"trust\" associations." },
        { term: "Cognitive Bias", def: "Predictable patterns in human thought that influence how people make buying decisions (e.g., the Bandwagon Effect)." },
        { term: "Cognitive Load", def: "The amount of mental effort required to process information. We design sites with \"low cognitive load\" to prevent user fatigue." },
        { term: "Content Curation", def: "Finding and sharing relevant content from other sources to build authority in your niche." },
        { term: "Content Marketing", def: "Creating valuable, relevant content to attract and engage a target audience by solving their biological pain points." },
        { term: "Conversion Tracking", def: "Measuring when a user completes a desired action, such as a purchase or sign-up." },
        { term: "CPC (Cost Per Click)", def: "The amount paid each time a user clicks on a digital advertisement." },
        { term: "CPM (Cost Per Mille)", def: "The cost of showing an advertisement to 1,000 people." },
        { term: "Creative Commons", def: "A licensing system that allows creators to share work under specific usage conditions." },
        { term: "Crowdsourcing", def: "Gathering ideas or content from a large group of people to foster community engagement." },
        { term: "Customer Journey", def: "The complete experience a customer has with a brand, from the first neural spark of awareness to post-purchase loyalty." },
    ],
    D: [
        { term: "Dark Social", def: "Sharing that happens in private channels (like text or DM). It is highly influential because it comes from a \"trusted tribe\" source." },
        { term: "Decision Fatigue", def: "A state where the brain is overwhelmed by choices, leading to no action. We simplify the \"choice architecture\" to prevent this." },
        { term: "Dopamine", def: "The \"reward\" chemical in the brain. Digital marketing often uses notifications and rewards to trigger dopamine releases." },
    ],
    E: [
        { term: "E-E-A-T", def: "A Google ranking standard: Experience, Expertise, Authoritativeness, and Trustworthiness." },
        { term: "Engagement Rate", def: "A metric measuring how much a person interacts with content, showing the level of emotional \"buy-in.\"" },
        { term: "Evergreen Content", def: "Content that stays relevant over time, providing a consistent \"return on investment\" for your SEO." },
    ],
    F: [
        { term: "Fear of Missing Out (FOMO)", def: "A psychological trigger used to drive action by highlighting the potential loss of a social or financial opportunity." },
        { term: "Featured Snippet", def: "A descriptive box at the top of Google results that satisfies the brain's need for a quick, direct answer." },
    ],
    G: [
        { term: "Google Business Profile (GBP)", def: "Your official digital storefront. It is the first \"trust signal\" the brain looks for when searching locally." },
        { term: "Google Search Console", def: "A tool for monitoring how Google's \"crawlers\" see and rank your website content." },
    ],
    H: [
        { term: "Heatmap", def: "A visual data tool that shows where users' eyes and mice are most active on a webpage." },
    ],
    I: [
        { term: "Implicit Association", def: "The subconscious link the brain makes between your brand and a specific feeling (like \"luxury\" or \"safety\")." },
        { term: "Inbound Marketing", def: "Attracting customers through helpful content that aligns with their internal search intent." },
    ],
    J: [
        { term: "Joint Marketing", def: "A strategy where brands co-create campaigns to share resources and psychological authority." },
        { term: "Journey Mapping", def: "Visualizing every step a customer takes to find and fix \"friction points\" that cause them to drop off." },
    ],
    K: [
        { term: "Keyword", def: "The specific phrase a human types into a search engine to fulfill a neural \"need\" or \"want.\"" },
        { term: "Keyword Research", def: "Analyzing search terms to prioritize content that meets user intent." },
        { term: "Keyword Stuffing", def: "An outdated tactic of overloading content with keywords, which creates a negative experience for the human brain." },
        { term: "Knowledge Panel", def: "An information box on Google that provides instant factual \"authority\" on a business or entity." },
        { term: "KPI (Key Performance Indicator)", def: "A measurable value that shows how effectively your company is reaching its growth targets." },
    ],
    L: [
        { term: "Landing Page", def: "A standalone page designed to capture a lead by focusing the user's attention on a single, clear goal." },
        { term: "Lead Magnet", def: "A free asset (like an ebook) offered in exchange for contact info, initiating the \"Reciprocity\" bias in the brain." },
        { term: "Limbic System", def: "The \"emotional\" part of the brain. We target this area to build long-term brand loyalty and sentiment." },
        { term: "Link Building", def: "The process of acquiring high-quality backlinks to boost your site's \"authority score.\"" },
        { term: "Local Pack", def: "The top three local business results on Google, which receive the majority of human \"trust\" clicks." },
    ],
    M: [
        { term: "Machine Learning", def: "A subset of AI that allows systems to learn patterns from data, much like a human brain learns from experience." },
        { term: "Marketing Funnel", def: "A strategic model mapping the customer journey from the \"top\" (awareness) to the \"bottom\" (purchase)." },
        { term: "Mirror Neurons", def: "Brain cells that fire when watching others. This is why \"customer success stories\" are more effective than simple ad copy." },
        { term: "Multi-channel Attribution", def: "Assigning credit to the different touchpoints (social, email, search) that led to a conversion." },
    ],
    N: [
        { term: "NAP Consistency", def: "Keeping your Name, Address, and Phone number identical everywhere to build \"algorithmic trust.\"" },
        { term: "Native Advertising", def: "Paid ads that match the look and feel of the site they appear on, reducing \"ad blindness\" in the brain." },
        { term: "Neurobiology", def: "The study of the nervous system and how it processes sensory input from digital marketing." },
        { term: "Neuromarketing", def: "Using brain science (like eye-tracking or EEG) to study how consumers respond to marketing stimuli." },
        { term: "Neuroscience", def: "The scientific study of the nervous system, used by BioDynamX to align marketing with human biology." },
        { term: "Newsletter", def: "A periodic email that keeps your brand \"top of mind\" in the customer's memory." },
        { term: "Niche Audience", def: "A narrowly defined group of people with specific needs that allow for highly relevant messaging." },
    ],
    O: [
        { term: "Omnichannel Strategy", def: "A seamless, integrated customer experience across all digital and physical touchpoints." },
        { term: "On-Page SEO", def: "Optimizing individual pages (content and code) to rank higher and satisfy user intent." },
        { term: "Online Reputation Management (ORM)", def: "The practice of monitoring and influencing how a brand is perceived in the \"court of public opinion.\"" },
        { term: "Organic Reach", def: "The number of people who see your content without you paying for an ad to show it to them." },
    ],
    P: [
        { term: "Page Speed", def: "How fast your site loads. The human brain expects a site to load in under 2 seconds; anything slower triggers a \"frustration\" response." },
        { term: "Paid Media", def: "Marketing channels where you pay to distribute your message (like Google Ads or Facebook Ads)." },
        { term: "Persona Development", def: "Creating detailed \"ideal customer\" profiles to ensure your marketing speaks to a real human need." },
        { term: "PPC (Pay-Per-Click)", def: "An advertising model where you only pay when a human actually shows interest by clicking." },
        { term: "Priming", def: "A psychological technique where exposure to one stimulus influences how a person responds to a later stimulus." },
    ],
    Q: [
        { term: "Qualified Lead", def: "A prospect who has shown enough interest and has the right traits to be a high-value customer." },
        { term: "Quality Score", def: "A metric used by Google to determine the relevance and quality of your ads." },
        { term: "Query", def: "The word or phrase a user speaks or types into a search engine." },
    ],
    R: [
        { term: "Ranking Factors", def: "The specific signals (speed, content, links) search engines use to decide who gets the #1 spot." },
        { term: "Reach", def: "The total number of unique brains that have seen your content or ad." },
        { term: "Reptilian Brain", def: "See Basal Ganglia. The part of the brain that makes 95% of all buying decisions based on instinct and survival." },
        { term: "Retargeting", def: "Serving ads to people who have already visited your site, taking advantage of the \"Familiarity Principle.\"" },
        { term: "Review Management", def: "The process of collecting and responding to reviews to influence public sentiment and SEO." },
        { term: "ROI (Return on Investment)", def: "The profit you make relative to what you spent on marketing." },
    ],
    S: [
        { term: "Sentiment Analysis", def: "Using AI to categorize the \"emotion\" (positive, negative, neutral) inside a customer review." },
        { term: "SEO (Search Engine Optimization)", def: "The practice of optimizing your site to rank higher in unpaid search results." },
        { term: "SERP", def: "Search Engine Results Page. This is the \"battleground\" where your site competes for human attention." },
        { term: "Social Listening", def: "Monitoring the internet for mentions of your brand to understand the real-time \"mood\" of your audience." },
        { term: "Social Proof", def: "Psychological evidence (like reviews) that others trust you, which lowers the \"risk barrier\" for new customers." },
    ],
    T: [
        { term: "Target Audience", def: "The specific group of people most likely to have the \"neural pain\" that your product solves." },
        { term: "Testimonial Marketing", def: "Using quotes from happy customers to build trust through the \"Mirror Neuron\" effect." },
        { term: "Tracking Pixel", def: "A small piece of code that lets you track user behavior across the web for smarter ad targeting." },
        { term: "Trust Signals", def: "Visual cues (logos, stars, certificates) that tell the user's brain \"it is safe to buy here.\"" },
    ],
    U: [
        { term: "UGC (User-Generated Content)", def: "Content created by your customers, which the human brain trusts more than \"polished\" corporate ads." },
        { term: "URL Shortener", def: "A tool that makes links compact and trackable, reducing visual clutter." },
        { term: "User Flow", def: "The path a user takes through your site; we optimize this for the \"path of least resistance.\"" },
        { term: "UTM Parameters", def: "Tags added to a URL to track exactly where your traffic is coming from." },
        { term: "UX (User Experience)", def: "How a human feels when interacting with your site. Great UX satisfies the brain's need for order and ease." },
    ],
    V: [
        { term: "Video Marketing", def: "Using video to engage the brain's visual and auditory centers simultaneously, leading to higher recall." },
        { term: "Viral Content", def: "Content that spreads rapidly because it triggers a high-arousal emotional response (awe, anger, or amusement)." },
        { term: "Voice Search", def: "Verbal queries made to AI assistants, which are typically more \"conversational\" than typed searches." },
    ],
    W: [
        { term: "Webinar", def: "A live online presentation used to build authority and educate a target audience in real-time." },
        { term: "White Hat SEO", def: "Ethical marketing tactics that focus on a human-first experience rather than \"gaming\" the system." },
        { term: "Word-of-Mouth", def: "The most powerful marketing channel; it relies on biological trust between individuals." },
    ],
    X: [
        { term: "X (formerly Twitter)", def: "A real-time social platform for short-form engagement and brand news." },
        { term: "XML Sitemap", def: "A technical file that tells search engines exactly where all the pages on your site are located." },
    ],
    Y: [
        { term: "Year-over-Year (YoY) Growth", def: "A comparison of performance metrics against the same period in the previous year." },
        { term: "YMYL (Your Money or Your Life)", def: "A Google standard for pages that can impact a person's health or finances; these require the highest \"trust signals.\"" },
        { term: "YouTube SEO", def: "Optimizing video content to rank in the world's second-largest search engine." },
    ],
    Z: [
        { term: "Zero-Click Search", def: "When Google provides the answer immediately on the search page, satisfying the user's \"instant gratification\" instinct." },
        { term: "Z-index", def: "A technical property that determines which elements on a webpage appear \"on top\" of others." },
    ],
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Brain-related emojis for each letter section
const LETTER_ICONS: Record<string, string> = {
    A: "🧪", B: "🧬", C: "💡", D: "🎯", E: "⚡", F: "🔥",
    G: "🌐", H: "🔍", I: "🧲", J: "🤝", K: "🔑", L: "🧠",
    M: "🪞", N: "🔬", O: "🔗", P: "⚙️", Q: "📊", R: "🚀",
    S: "📡", T: "🛡️", U: "👤", V: "🎬", W: "📣", X: "✖️",
    Y: "📈", Z: "⚡",
};

// Per-term icons — each icon visually represents the concept
const TERM_ICONS: Record<string, string> = {
    // A
    "A/B Testing": "🧪",
    "Algorithm": "🧮",
    "Analytics": "📊",
    "Amygdala Hijack": "🧠",
    "Artificial Intelligence (AI)": "🤖",
    "Audience Segmentation": "👥",
    "Automation": "⚙️",
    // B
    "Backlink": "🔗",
    "Basal Ganglia (Reptilian Brain)": "🦎",
    "Biometrics": "👁️",
    "Bounce Rate": "📉",
    "Brand Advocate": "📣",
    "Brand Authenticity": "✅",
    "Brand Awareness": "🏷️",
    "Brand Style Guide": "🎨",
    "Business Objective": "🎯",
    "Buyer Persona": "🧑‍💼",
    // C
    "Call to Action (CTA)": "👆",
    "Carousel Ads": "🎠",
    "Character Count": "🔢",
    "Chatbot": "💬",
    "Click-Through Rate (CTR)": "🖱️",
    "Clickbait": "🪝",
    "Co-marketing": "🤝",
    "Cognitive Bias": "🧲",
    "Cognitive Load": "🏋️",
    "Content Curation": "📚",
    "Content Marketing": "✍️",
    "Conversion Tracking": "📈",
    "CPC (Cost Per Click)": "💰",
    "CPM (Cost Per Mille)": "💵",
    "Creative Commons": "©️",
    "Crowdsourcing": "🌍",
    "Customer Journey": "🗺️",
    // D
    "Dark Social": "🌑",
    "Decision Fatigue": "😵",
    "Dopamine": "💊",
    // E
    "E-E-A-T": "⭐",
    "Engagement Rate": "❤️",
    "Evergreen Content": "🌲",
    // F
    "Fear of Missing Out (FOMO)": "😰",
    "Featured Snippet": "✨",
    // G
    "Google Business Profile (GBP)": "📍",
    "Google Search Console": "🔎",
    // H
    "Heatmap": "🔥",
    // I
    "Implicit Association": "🧩",
    "Inbound Marketing": "🧲",
    // J
    "Joint Marketing": "🤝",
    "Journey Mapping": "🗺️",
    // K
    "Keyword": "🔑",
    "Keyword Research": "🔍",
    "Keyword Stuffing": "🚫",
    "Knowledge Panel": "📋",
    "KPI (Key Performance Indicator)": "📊",
    // L
    "Landing Page": "🛬",
    "Lead Magnet": "🧲",
    "Limbic System": "💜",
    "Link Building": "🔗",
    "Local Pack": "📍",
    // M
    "Machine Learning": "🤖",
    "Marketing Funnel": "🔻",
    "Mirror Neurons": "🪞",
    "Multi-channel Attribution": "📡",
    // N
    "NAP Consistency": "📇",
    "Native Advertising": "🎭",
    "Neurobiology": "🧬",
    "Neuromarketing": "🧠",
    "Neuroscience": "🔬",
    "Newsletter": "📧",
    "Niche Audience": "🎯",
    // O
    "Omnichannel Strategy": "🔄",
    "On-Page SEO": "📄",
    "Online Reputation Management (ORM)": "⭐",
    "Organic Reach": "🌱",
    // P
    "Page Speed": "⚡",
    "Paid Media": "💳",
    "Persona Development": "🧑‍💼",
    "PPC (Pay-Per-Click)": "💰",
    "Priming": "🧠",
    // Q
    "Qualified Lead": "✅",
    "Quality Score": "⭐",
    "Query": "❓",
    // R
    "Ranking Factors": "📊",
    "Reach": "📡",
    "Reptilian Brain": "🦎",
    "Retargeting": "🎯",
    "Review Management": "⭐",
    "ROI (Return on Investment)": "💰",
    // S
    "Sentiment Analysis": "😊",
    "SEO (Search Engine Optimization)": "🔍",
    "SERP": "🏆",
    "Social Listening": "👂",
    "Social Proof": "👍",
    // T
    "Target Audience": "🎯",
    "Testimonial Marketing": "💬",
    "Tracking Pixel": "📍",
    "Trust Signals": "🛡️",
    // U
    "UGC (User-Generated Content)": "📸",
    "URL Shortener": "🔗",
    "User Flow": "➡️",
    "UTM Parameters": "🏷️",
    "UX (User Experience)": "🎨",
    // V
    "Video Marketing": "🎬",
    "Viral Content": "🔥",
    "Voice Search": "🎙️",
    // W
    "Webinar": "💻",
    "White Hat SEO": "🤍",
    "Word-of-Mouth": "🗣️",
    // X
    "X (formerly Twitter)": "✖️",
    "XML Sitemap": "🗂️",
    // Y
    "Year-over-Year (YoY) Growth": "📈",
    "YMYL (Your Money or Your Life)": "💰",
    "YouTube SEO": "▶️",
    // Z
    "Zero-Click Search": "⚡",
    "Z-index": "📐",
};

export default function GlossaryPage() {
    const [heroRef, heroVisible] = useScrollReveal();
    const [activeLetter, setActiveLetter] = useState("A");
    const [searchQuery, setSearchQuery] = useState("");
    const [showBackToTop, setShowBackToTop] = useState(false);
    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

    // Show back-to-top button after scrolling
    useEffect(() => {
        const onScroll = () => setShowBackToTop(window.scrollY > 600);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Track active letter on scroll
    useEffect(() => {
        const handler = () => {
            const letters = ALPHABET.filter(l => GLOSSARY[l]);
            for (let i = letters.length - 1; i >= 0; i--) {
                const el = sectionRefs.current[letters[i]];
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= 160) {
                        setActiveLetter(letters[i]);
                        break;
                    }
                }
            }
        };
        window.addEventListener("scroll", handler, { passive: true });
        return () => window.removeEventListener("scroll", handler);
    }, []);

    const scrollToLetter = (letter: string) => {
        const el = sectionRefs.current[letter];
        if (el) {
            const yOffset = -140;
            const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    };

    // Filter glossary entries based on search
    const filteredGlossary: Record<string, { term: string; def: string }[]> = {};
    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        for (const letter of ALPHABET) {
            if (!GLOSSARY[letter]) continue;
            const matches = GLOSSARY[letter].filter(
                e => e.term.toLowerCase().includes(q) || e.def.toLowerCase().includes(q)
            );
            if (matches.length > 0) filteredGlossary[letter] = matches;
        }
    }

    const displayGlossary = searchQuery.trim() ? filteredGlossary : GLOSSARY;
    const totalTerms = Object.values(GLOSSARY).reduce((sum, arr) => sum + arr.length, 0);

    return (
        <main style={{
            minHeight: "100vh",
            background: "#050505",
            color: "#fff",
            fontFamily: "'Inter', system-ui, sans-serif",
            overflowX: "hidden",
        }}>
            {/* ═══ CSS ═══ */}
            <style>{`
                @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes shimmerGrad {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes borderGlow {
                    0%, 100% { border-color: rgba(0,255,65,0.15); }
                    50% { border-color: rgba(0,255,65,0.35); }
                }
                @keyframes pulseGlow {
                    0%, 100% { box-shadow: 0 0 20px rgba(0,255,65,0.08); }
                    50% { box-shadow: 0 0 40px rgba(0,255,65,0.2); }
                }
                .gloss-gradient-text {
                    background: linear-gradient(90deg, #00ff41 0%, #00cc33 25%, #3b82f6 50%, #00ff41 75%, #00cc33 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: shimmerGrad 8s ease-in-out infinite;
                }
                .gloss-nav-link {
                    font-size: 13px;
                    font-weight: 600;
                    color: rgba(255,255,255,0.7);
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .gloss-nav-link:hover { color: #00ff41; }
                .gloss-term-card {
                    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .gloss-term-card:hover {
                    transform: translateY(-3px);
                    border-color: rgba(0,255,65,0.2);
                    background: rgba(0,255,65,0.04);
                }
                .alpha-btn {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                    border: 1px solid transparent;
                    background: transparent;
                    color: rgba(255,255,255,0.4);
                }
                .alpha-btn:hover {
                    background: rgba(0,255,65,0.08);
                    color: #00ff41;
                    border-color: rgba(0,255,65,0.15);
                }
                .alpha-btn.active {
                    background: rgba(0,255,65,0.12);
                    color: #00ff41;
                    border-color: rgba(0,255,65,0.3);
                    box-shadow: 0 0 12px rgba(0,255,65,0.15);
                    font-weight: 800;
                }
                .alpha-btn.disabled {
                    opacity: 0.2;
                    cursor: default;
                    pointer-events: none;
                }
                .search-input {
                    width: 100%;
                    max-width: 400px;
                    padding: 12px 20px 12px 44px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    color: #fff;
                    font-size: 14px;
                    font-family: inherit;
                    outline: none;
                    transition: all 0.3s;
                }
                .search-input:focus {
                    border-color: rgba(0,255,65,0.3);
                    background: rgba(0,255,65,0.04);
                    box-shadow: 0 0 20px rgba(0,255,65,0.08);
                }
                .search-input::placeholder { color: rgba(255,255,255,0.3); }
                .back-to-top-btn {
                    position: fixed;
                    bottom: 32px;
                    right: 32px;
                    z-index: 60;
                    width: 48px;
                    height: 48px;
                    border-radius: 14px;
                    border: 1px solid rgba(0,255,65,0.3);
                    background: rgba(10,10,10,0.95);
                    backdrop-filter: blur(12px);
                    color: #00ff41;
                    font-size: 20px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.5), 0 0 15px rgba(0,255,65,0.1);
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    opacity: 0;
                    transform: translateY(20px);
                    pointer-events: none;
                }
                .back-to-top-btn.visible {
                    opacity: 1;
                    transform: translateY(0);
                    pointer-events: auto;
                }
                .back-to-top-btn:hover {
                    background: rgba(0,255,65,0.12);
                    border-color: rgba(0,255,65,0.5);
                    box-shadow: 0 4px 24px rgba(0,0,0,0.5), 0 0 25px rgba(0,255,65,0.2);
                    transform: translateY(-3px);
                }
                @media (max-width: 768px) {
                    nav { padding: 12px 16px !important; }
                    nav .gloss-nav-link { display: none; }
                    .alpha-bar-inner { gap: 2px !important; }
                    .alpha-btn { width: 28px !important; height: 28px !important; font-size: 10px !important; }
                    .back-to-top-btn { bottom: 20px; right: 20px; width: 44px; height: 44px; }
                }
            `}</style>

            {/* ═══ Navigation ═══ */}
            <nav style={{
                position: "sticky", top: 0, zIndex: 50,
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "16px 32px",
                background: "rgba(10,10,10,0.96)",
                backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}>
                <Link href="/" style={{
                    textDecoration: "none", display: "flex", alignItems: "center", gap: 12,
                }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: "linear-gradient(135deg, #00ff41, #00cc33)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, fontWeight: 900, color: "#000",
                        boxShadow: "0 0 15px rgba(0,255,65,0.2)",
                    }}>B</div>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>BioDynamX</div>
                        <div style={{ fontSize: 11, color: "rgba(0,255,65,0.7)", letterSpacing: "0.1em", textTransform: "uppercase" as const, fontWeight: 700 }}>Engineering Group</div>
                    </div>
                </Link>
                <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                    {[
                        { label: "Pricing", href: "/pricing" },
                        { label: "Free Audit", href: "/audit" },
                        { label: "About", href: "/about" },
                        { label: "Blog", href: "/blog" },
                    ].map(link => (
                        <Link key={link.label} href={link.href} className="gloss-nav-link">{link.label}</Link>
                    ))}
                    <Link href="/" style={{
                        padding: "8px 20px",
                        background: "linear-gradient(135deg, #00ff41, #00cc33)",
                        border: "none", borderRadius: 8,
                        color: "#000", fontSize: 12, fontWeight: 800,
                        textDecoration: "none",
                        boxShadow: "0 0 15px rgba(0,255,65,0.2)",
                        transition: "all 0.3s",
                    }}>Talk to Jenny</Link>
                </div>
            </nav>

            {/* ═══ HERO ═══ */}
            <section
                ref={heroRef}
                style={{
                    textAlign: "center", padding: "80px 24px 60px",
                    opacity: heroVisible ? 1 : 0,
                    transform: heroVisible ? "translateY(0)" : "translateY(40px)",
                    transition: "all 0.8s ease-out",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Background hero image */}
                <div style={{
                    position: "absolute", inset: 0, zIndex: 0, opacity: 0.15,
                }}>
                    <Image
                        src="/glossary-hero.png"
                        alt="Neural Network Glossary Background"
                        fill
                        style={{ objectFit: "cover", objectPosition: "center" }}
                        priority
                    />
                </div>
                {/* Gradient overlay */}
                <div style={{
                    position: "absolute", inset: 0, zIndex: 1,
                    background: "linear-gradient(180deg, rgba(5,5,5,0.4) 0%, rgba(5,5,5,0.9) 80%, #050505 100%)",
                }} />

                <div style={{ position: "relative", zIndex: 2 }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "6px 18px",
                        background: "rgba(0,255,65,0.08)",
                        border: "1px solid rgba(0,255,65,0.2)",
                        borderRadius: 100,
                        fontSize: 11, fontWeight: 700, color: "#00ff41",
                        letterSpacing: "0.06em", marginBottom: 24,
                        animation: "borderGlow 3s ease-in-out infinite",
                    }}>
                        📖 {totalTerms} TERMS · NEUROSCIENCE · DIGITAL GROWTH
                    </div>

                    <h1 style={{
                        fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800,
                        lineHeight: 1.1, marginBottom: 20, letterSpacing: "-0.04em",
                    }}>
                        The BioDynamX{" "}
                        <span className="gloss-gradient-text">A–Z Glossary</span>
                    </h1>

                    <p style={{
                        fontSize: "clamp(15px, 1.6vw, 18px)", color: "rgba(255,255,255,0.55)",
                        maxWidth: 650, margin: "0 auto 12px", lineHeight: 1.65,
                    }}>
                        Where Neuroscience Meets Digital Growth
                    </p>
                    <p style={{
                        fontSize: 14, color: "rgba(255,255,255,0.4)",
                        maxWidth: 600, margin: "0 auto 32px", lineHeight: 1.6,
                    }}>
                        Tired of industry jargon? Our A–Z glossary breaks down the most-used terms
                        in online reputation, customer experience, and neuro-marketing — simple, clear,
                        and always up to date.
                    </p>

                    {/* Search bar */}
                    <div style={{ position: "relative", display: "inline-block" }}>
                        <span style={{
                            position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                            fontSize: 16, pointerEvents: "none", opacity: 0.4,
                        }}>🔍</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search terms..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* ═══ STICKY ALPHABET BAR ═══ */}
            <div style={{
                position: "sticky", top: 62, zIndex: 40,
                background: "rgba(10,10,10,0.96)",
                backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                padding: "10px 16px",
            }}>
                <div className="alpha-bar-inner" style={{
                    maxWidth: 1100, margin: "0 auto",
                    display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 4,
                }}>
                    {ALPHABET.map(letter => {
                        const hasTerms = !!GLOSSARY[letter];
                        const isActive = activeLetter === letter && !searchQuery.trim();
                        return (
                            <button
                                key={letter}
                                className={`alpha-btn ${isActive ? "active" : ""} ${!hasTerms ? "disabled" : ""}`}
                                onClick={() => { if (hasTerms) { setSearchQuery(""); scrollToLetter(letter); } }}
                                aria-label={`Jump to letter ${letter}`}
                            >
                                {letter}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ═══ GLOSSARY CONTENT ═══ */}
            <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>
                {searchQuery.trim() && Object.keys(filteredGlossary).length === 0 && (
                    <div style={{
                        textAlign: "center", padding: "60px 20px",
                        color: "rgba(255,255,255,0.4)", fontSize: 16,
                    }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                        No terms found for &ldquo;{searchQuery}&rdquo;. Try a different search.
                    </div>
                )}

                {ALPHABET.map(letter => {
                    if (!displayGlossary[letter]) return null;
                    const terms = displayGlossary[letter];
                    return (
                        <section
                            key={letter}
                            ref={(el) => { sectionRefs.current[letter] = el; }}
                            id={`letter-${letter}`}
                            style={{ marginBottom: 48 }}
                        >
                            {/* Letter Header */}
                            <div style={{
                                display: "flex", alignItems: "center", gap: 14,
                                marginBottom: 20,
                                paddingBottom: 16,
                                borderBottom: "1px solid rgba(255,255,255,0.06)",
                            }}>
                                <div style={{
                                    width: 52, height: 52,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    borderRadius: 14,
                                    background: "linear-gradient(135deg, rgba(0,255,65,0.08), rgba(59,130,246,0.08))",
                                    border: "1px solid rgba(0,255,65,0.15)",
                                    fontSize: 24, fontWeight: 900,
                                    color: "#00ff41",
                                    animation: "pulseGlow 4s ease-in-out infinite",
                                }}>
                                    {letter}
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase" as const }}>
                                        {LETTER_ICONS[letter]} {terms.length} {terms.length === 1 ? "term" : "terms"}
                                    </div>
                                </div>
                            </div>

                            {/* Terms */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {terms.map((entry, i) => (
                                    <div
                                        key={entry.term}
                                        className="gloss-term-card"
                                        style={{
                                            padding: "20px 24px",
                                            borderRadius: 16,
                                            background: "rgba(255,255,255,0.02)",
                                            border: "1px solid rgba(255,255,255,0.06)",
                                            animation: `fadeUp 0.4s ease-out ${i * 0.04}s both`,
                                        }}
                                    >
                                        <div style={{
                                            fontSize: 16, fontWeight: 700,
                                            color: "#fff",
                                            marginBottom: 6,
                                            letterSpacing: "-0.01em",
                                        }}>
                                            <span style={{ marginRight: 8, fontSize: 18, opacity: 0.85, display: "inline-block", width: 22, textAlign: "center" }}>{TERM_ICONS[entry.term] || "●"}</span>
                                            {entry.term}
                                        </div>
                                        <p style={{
                                            fontSize: 14, color: "rgba(255,255,255,0.55)",
                                            lineHeight: 1.7, margin: 0,
                                            paddingLeft: 20,
                                        }}>
                                            {entry.def}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>

            {/* ═══ CTA SECTION ═══ */}
            <section style={{
                padding: "80px 24px",
                textAlign: "center",
                background: "linear-gradient(180deg, transparent, rgba(0,255,65,0.03))",
                borderTop: "1px solid rgba(0,255,65,0.08)",
                position: "relative",
            }}>
                <div style={{
                    position: "absolute", bottom: 0, left: "50%",
                    transform: "translateX(-50%)",
                    width: 800, height: 400,
                    background: "radial-gradient(ellipse, rgba(0,255,65,0.04) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />

                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 18px",
                    background: "rgba(59,130,246,0.08)",
                    border: "1px solid rgba(59,130,246,0.2)",
                    borderRadius: 100,
                    fontSize: 11, fontWeight: 700, color: "#3b82f6",
                    letterSpacing: "0.06em", marginBottom: 24,
                }}>
                    🧠 LET THE EXPERTS HANDLE IT
                </div>

                <h2 style={{
                    fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: 800,
                    marginBottom: 16, letterSpacing: "-0.03em",
                    position: "relative",
                }}>
                    Confused by the science?{" "}
                    <span className="gloss-gradient-text">Let BioDynamX handle it.</span>
                </h2>
                <p style={{
                    fontSize: 16, color: "rgba(255,255,255,0.5)",
                    maxWidth: 550, margin: "0 auto 36px", lineHeight: 1.65,
                }}>
                    Our neuroscience-trained AI agents apply every concept in this glossary —
                    automatically, 24/7, so you can focus on running your business.
                </p>

                <div style={{ position: "relative", display: "inline-block" }}>
                    <div style={{
                        position: "absolute", inset: -12,
                        borderRadius: 24,
                        background: "radial-gradient(ellipse, rgba(0,255,65,0.12) 0%, transparent 70%)",
                        animation: "pulseGlow 3s ease-in-out infinite",
                        pointerEvents: "none",
                    }} />
                    <Link href="/" style={{
                        display: "inline-block", position: "relative",
                        padding: "18px 40px", borderRadius: 14,
                        background: "linear-gradient(135deg, #00ff41, #00cc33)",
                        color: "#000", textDecoration: "none", fontWeight: 800, fontSize: 17,
                        boxShadow: "0 4px 40px rgba(0,255,65,0.3)",
                        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                        letterSpacing: "-0.01em",
                    }}>
                        Talk to Jenny — Free Audit
                    </Link>
                </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer style={{
                padding: "40px 24px", textAlign: "center",
                borderTop: "1px solid rgba(255,255,255,0.05)",
            }}>
                <div style={{
                    display: "flex", justifyContent: "center", gap: 24,
                    flexWrap: "wrap", marginBottom: 20,
                }}>
                    {[
                        { label: "Home", href: "/" },
                        { label: "Pricing", href: "/pricing" },
                        { label: "Free Audit", href: "/audit" },
                        { label: "About", href: "/about" },
                        { label: "Blog", href: "/blog" },
                        { label: "Security", href: "/security" },
                    ].map(link => (
                        <Link key={link.label} href={link.href} style={{
                            fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.4)",
                            textDecoration: "none", transition: "color 0.2s",
                        }}>{link.label}</Link>
                    ))}
                </div>
                <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>
                    © {new Date().getFullYear()} BioDynamX Engineering Group. The Neurobiology of Choice.
                </div>
            </footer>

            {/* ═══ FLOATING BACK-TO-TOP BUTTON ═══ */}
            <button
                className={`back-to-top-btn ${showBackToTop ? "visible" : ""}`}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                aria-label="Back to top"
            >
                ↑
            </button>
        </main>
    );
}
