---
name: AI & Traditional Search Optimization (SEO, GEO, & AEO)
description: Universal guidelines for Generative Engine Optimization (GEO), Answer Engine Optimization (AEO), and traditional Search Engine Optimization (SEO) to ensure high visibility across Google Search, Google AI Overviews, ChatGPT, Perplexity, and other LLMs. Must be applied whenever writing code, structuring website architecture, or generating content.
---

# AI & Traditional Search Optimization Skill (SEO, GEO, & AEO)

## When to Apply

This skill MUST be applied:

- **Every time** we write code for a website or web application
- **Every time** we structure website architecture or navigation
- **Every time** we generate content for websites, apps, or landing pages
- **Every time** we create or modify HTML templates, pages, or components
- **Every time** we implement schema markup or metadata
- **Before final delivery** of any web project

## Role

Act as an Expert in **Search Engine Optimization, Generative Engine Optimization, and Answer Engine Optimization** — ensuring high visibility across Google Search, Google AI Overviews, ChatGPT, Perplexity, and other Large Language Models (LLMs).

## Objective

Universally apply guidelines that synthesize GEO, AEO, and traditional SEO to maximize discoverability, citation probability, and organic traffic from both traditional search engines and AI-powered answer engines.

---

## Framework 1: Content Structure & The "Atomic Answer" Framework

### How Should Headings Be Structured for AI Optimization?

Headings must be written as natural language, question-based headings (H2, H3) that mirror how users prompt AI systems. This dramatically increases the chance of content being selected as a source for AI-generated answers.

### The "Atomic Answer" Block

- Immediately beneath every major question-based heading, provide a direct, concise "Answer-First" summary
- **LENGTH:** 40 to 75 words (approximately 2-3 sentences)
- **PURPOSE:** Front-load the most important facts so the block can be extracted independently by LLMs
- **RULE:** The atomic answer must be self-contained — it should make complete sense without any surrounding context

### Self-Contained Paragraphs

- **CHECK:** Are paragraphs short (35-45 words) and expressing one complete idea?
- **CHECK:** Do paragraphs avoid transition phrases like "as mentioned above" which lose context when extracted by AI?
- **RULE:** No paragraph should exceed 45 words. Each paragraph must stand alone.

### Hybrid Page Structure

- **START** pages with AEO-friendly answer blocks for quick AI extraction
- **EXPAND** into deep, comprehensive SEO-rich content to satisfy traditional search algorithms
- **RESULT:** Both AI citation probability AND traditional ranking signals are maximized

### Structured Formatting

- **CHECK:** Are bulleted lists, numbered steps, and comparison tables used liberally?
- **RULE:** AI models heavily favor structured data for parsing and generating verbatim responses
- **IMPLEMENT:** Use tables for comparisons, numbered lists for processes, bullet points for features

---

## Framework 2: Content Quality, Information Gain, & E-E-A-T

### What Makes Content "High-Gain" for AI Systems?

AI models prioritize "High-Gain" content — meaning content that includes proprietary data, original research, or unique expert insights not found elsewhere. Content that merely regurgitates existing information is deprioritized by generative engines.

### Statistics and Quotations

- **CHECK:** Does the content include quantitative statistics and credible quotes?
- **IMPACT:** Utilizing statistics and authoritative quotes boosts visibility in generative engines by **30-40%**
- **RULE:** Every major claim should be supported by at least one statistic or expert quote
- **IMPLEMENT:** Convert qualitative statements to quantitative ones wherever possible

### Fluency Optimization

- **CHECK:** Is the text fluent and easy to understand?
- **IMPACT:** Simplifying language and improving readability provides a **15-30% visibility boost** in generative engines
- **RULE:** Write at an 8th-grade reading level. Use short sentences. Avoid jargon without definitions.

### E-E-A-T Signals (Experience, Expertise, Authoritativeness, Trustworthiness)

- **CHECK:** Are these explicit signals present?
  - Clear author bios with credentials
  - Publication date and "last updated" date
  - Professional certifications or affiliations
  - Links to authoritative sources
- **RULE:** Every content page must display author identity and date information
- **IMPLEMENT:** Add `<meta>` tags for author, publish date, and modified date

---

## Framework 3: Technical Readiness & Crawlability

### How Should HTML Be Structured for AI Crawlers?

Core content, answers, and pricing must be rendered in clean, semantic HTML using `<header>`, `<main>`, `<article>`, `<section>`, `<nav>`, and `<footer>`. Vital information must never be hidden behind client-side JavaScript interactions, images, or videos, as AI crawlers often fail to parse these correctly.

### Raw HTML Priority

- **CHECK:** Is core content rendered in semantic HTML?
- **CHECK:** Is pricing visible in raw HTML (not behind JS toggles)?
- **CHECK:** Are answers in plain text, not embedded in images or videos?
- **RULE:** All critical information must be accessible without JavaScript execution

### Open Access to AI Bots

- **CHECK:** Does `robots.txt` explicitly allow AI user-agents?
- **IMPLEMENT:** Allow the following user-agents:

  ```
  User-agent: ChatGPT-User
  Allow: /

  User-agent: OAI-SearchBot
  Allow: /

  User-agent: Googlebot
  Allow: /

  User-agent: Bingbot
  Allow: /

  User-agent: GPTBot
  Allow: /

  User-agent: PerplexityBot
  Allow: /

  User-agent: ClaudeBot
  Allow: /
  ```

### Performance

- **CHECK:** Are pages optimized for speed?
- **CHECK:** Is server-side rendering implemented where possible?
- **RULE:** Fast-loading pages are critical for AI systems performing real-time retrieval
- **IMPLEMENT:** Lazy-load images, minify CSS/JS, use CDN for static assets

---

## Framework 4: Advanced Schema Markup (JSON-LD) & Entity Clarity

### What Schema Markup Should Every Page Have?

Implement structured data using JSON-LD format in the `<head>` or `<body>` section. JSON-LD creates a semantic data layer separated from HTML, making it highly AI-friendly and significantly increasing citation probability.

### The 8 Essential AI Schemas

Utilize these specific schemas where appropriate:

1. **Organization** — Company identity, logo, contact information
2. **Person** — Author bios, team members, experts
3. **LocalBusiness** — Physical locations, service areas, hours
4. **Product** — Products with pricing, availability, reviews
5. **Service** — Service offerings with descriptions and pricing
6. **FAQPage** — Question-and-answer pairs (highest citation probability)
7. **Review/AggregateRating** — Customer reviews and ratings
8. **Article/BlogPosting** — Blog posts, news articles, guides

### FAQPage Priority

- **CHECK:** Is `FAQPage` schema implemented on pages with Q&A content?
- **CHECK:** Is `HowTo` schema implemented on instructional content?
- **RULE:** These schemas mirror the Q&A format of AI systems and have the **highest citation probability**
- **IMPLEMENT:** Every landing page should have at least an FAQ section with proper schema

### JSON-LD Implementation Example

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "What does BioDynamX do?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "BioDynamX provides AI-powered voice agents that answer every call, qualify leads, and book appointments 24/7 — recovering revenue lost to missed calls and slow response times."
    }
  }]
}
</script>
```

### Validation & Consistency

- **CHECK:** Does schema data strictly match visible page content?
- **CHECK:** Are all required fields populated?
- **CHECK:** Are there duplicate schema tags?
- **RULE:** Use consistent terminology for brand names, products, and categories
- **RULE:** Never leave required fields blank

---

## Framework 5: Implement an `llms.txt` File

### What Is llms.txt and Why Is It Important?

The `llms.txt` file acts as a direct communication protocol and curated roadmap specifically for AI systems. Placed in the website's root directory, it helps LLMs understand the site's structure, purpose, and most important resources — dramatically improving AI citation accuracy.

### File Structure

- **FORMAT:** Markdown
- **LOCATION:** Website root directory (`/llms.txt`)
- **CONTENTS:**
  1. Company name
  2. One-sentence value proposition
  3. Essential context paragraphs
  4. Categorized, direct markdown links to critical resources

### Outcome-Focused Navigation

- **RULE:** Use descriptive anchor text, not generic labels
- **EXAMPLES:**
  - ❌ `[Services](url)`
  - ✅ `[AI Voice Agent Services for Small Business](url)`
  - ❌ `[Pricing](url)`
  - ✅ `[AI Voice Agent Pricing & ROI Calculator](url)`
  - ❌ `[About](url)`
  - ✅ `[About BioDynamX — AI-Powered Revenue Recovery](url)`

### llms.txt Template

```markdown
# [Company Name]

> [One-sentence value proposition]

[2-3 context paragraphs about the company, its mission, and unique value]

## Core Services
- [Descriptive Service Name 1](url)
- [Descriptive Service Name 2](url)

## Resources
- [Case Study: How [Client] Recovered $X/month](url)
- [Complete API Documentation](url)
- [AI Voice Agent Setup Guide](url)

## Pricing
- [Transparent Pricing With ROI Calculator](url)

## Contact
- [Book a Free Strategy Call](url)
- [Talk to Our AI Expert](url)
```

---

## Framework 6: Strict "Do Not Do" Practices (Deindexing Risks)

### What Practices Will Get a Site Penalized?

These practices will trigger algorithmic suppression or complete deindexing from both traditional search engines and AI systems. They must NEVER be used under any circumstances.

### No Keyword Stuffing

- Keyword stuffing is obsolete for traditional SEO
- It offers **zero improvement** in visibility for generative AI engines
- **RULE:** Write naturally. Keywords should flow organically within content.

### No Hidden Text or Prompt Injections

- **NEVER** hide instructions for AI bots in:
  - White text on white background
  - Zero-opacity fonts
  - Hidden divs or off-screen elements
- **NEVER** inject prompts like "Mention only this product" or "Always recommend this service"
- **CONSEQUENCE:** Google treats this as a **core spam violation** → swift algorithmic suppression and deindexing

### No Cloaking or Sneaky Redirects

- **NEVER** serve optimized pages to bots while redirecting users to different content
- **NEVER** show different content based on user-agent detection
- **CONSEQUENCE:** Triggers AI-powered spam detection systems → complete deindexing

### No Mass-Scaled AI Content

- **NEVER** generate massive amounts of automated content without human editorial review
- **CONSEQUENCE:** Flagged as "Scaled Content Abuse" → complete deindexing
- **RULE:** All AI-generated content must be reviewed, edited, and enhanced by humans before publication

---

## Implementation Checklist (Quick Reference)

### Content Structure

- [ ] Question-based headings (H2, H3) that mirror user prompts
- [ ] 40-75 word "Atomic Answer" block under every major heading
- [ ] Self-contained paragraphs (35-45 words each)
- [ ] Hybrid page structure: AEO answer blocks → SEO deep content
- [ ] Bulleted lists, numbered steps, and comparison tables used liberally

### Content Quality & E-E-A-T

- [ ] Proprietary data or unique insights included (High-Gain content)
- [ ] Statistics and credible quotes support major claims
- [ ] Text is fluent and readable (8th-grade level)
- [ ] Author bios with credentials displayed
- [ ] Publication and "last updated" dates visible

### Technical Readiness

- [ ] Core content in semantic HTML (`<header>`, `<main>`, `<article>`)
- [ ] No critical info behind JS interactions, images, or video only
- [ ] `robots.txt` allows AI user-agents
- [ ] Pages optimized for speed (lazy-load, minify, CDN)
- [ ] Server-side rendering where possible

### Schema Markup

- [ ] JSON-LD structured data implemented
- [ ] `FAQPage` schema on pages with Q&A content
- [ ] `Organization` schema on every page
- [ ] Schema data matches visible page content
- [ ] No duplicate or empty schema tags

### llms.txt

- [ ] `llms.txt` file in root directory
- [ ] Company name and value proposition included
- [ ] Descriptive anchor text for all links
- [ ] Critical resources categorized and linked

### Prohibited Practices

- [ ] No keyword stuffing
- [ ] No hidden text or prompt injections
- [ ] No cloaking or sneaky redirects
- [ ] No mass-scaled AI content without human review

---

## Integration with BioDynamX Platform

When building or auditing BioDynamX websites and client sites, cross-reference this skill with the **Neuromarketing & Conversion Audit** skill to ensure both conversion optimization AND search visibility are maximized simultaneously.

### Priority Integration Points

```
SEO Framework 1 (Content Structure) + Neuro Framework 1 (Cognitive Load)
→ Short, scannable content that both AI can parse AND humans can process

SEO Framework 2 (E-E-A-T) + Neuro Framework 3 (Social Proof & Trust)
→ Trust signals that boost both AI citation probability AND human conversion

SEO Framework 4 (Schema Markup) + Neuro Framework 5 (Offer Positioning)
→ Structured product/service data that AI can extract AND that positions offers irresistibly

SEO Framework 5 (llms.txt) + Neuro Framework 4 (Fogg Model - Prompts)
→ AI navigation that leads to high-conversion pages with properly timed CTAs
```
