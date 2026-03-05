---
description: Master pre-deploy orchestration — run this AUTOMATICALLY before every firebase deploy, no exceptions
---

# Master Pre-Deploy Orchestration

// turbo-all

> This workflow is NON-NEGOTIABLE. Every deploy to biodynamx.com runs through this checklist first.
> The AI (Antigravity) runs this autonomously. The user only approves the final firebase deploy command.

---

## TEAM ROSTER — Who runs what

| Agent | Role | When They Run |
|---|---|---|
| **Antigravity** | Lead Engineer + Orchestrator | Always — every task |
| **NeuroAdvisor** (skill) | Neuromarketing/Neurobiology/NLP audit | Every UI change |
| **SEO/GEO/AEO** (skill) | Search + AI discoverability audit | Every new page or content change |
| **Neuro-Conversion** (skill) | Conversion rate + friction audit | Every CTA or pricing change |
| **Web 4.0 Standard** (workflow) | Ambient intelligence checklist | Every feature add |
| **QA Self-Audit** (step below) | Functional + link + content check | Every deploy |

---

## Step 1 — Read Active Skills

Before doing ANY work on a page, load:

```
View file: .agent/skills/neuromarketing-neurosales/SKILL.md
View file: .agent/skills/neuro-conversion-audit/SKILL.md
View file: .agent/skills/seo-geo-aeo-optimization/SKILL.md
```

Apply ALL three frameworks to every page touched this session.

---

## Step 2 — NeuroAdvisor Pre-Flight (run on every changed page)

For each page modified, answer these before coding:

**Reptilian Check:**

- [ ] Does the hero trigger fear of loss or survival instinct within 3 seconds?
- [ ] Is the primary threat (missed calls, lost revenue, losing to competitors) visible above the fold?

**Limbic Check:**

- [ ] Is there an emotional story, vision, or image that creates desire?
- [ ] Does the copy make the prospect feel understood before it pitches?

**Neocortex Check:**

- [ ] Are all statistics verifiable (no fabricated numbers)?
- [ ] Is ROI math present and defensible (5x guarantee, $497/mo)?

**Color/CTA Check:**

- [ ] Primary CTA = green or orange?
- [ ] Trust elements = blue?
- [ ] Urgency elements = red?
- [ ] Max 1 CTA per viewport?

**NLP Check:**

- [ ] Are headlines using Hippocampal pattern (familiar phrase + twist)?
- [ ] Is copy in active voice, second person ("your", "you")?
- [ ] Are power words present: instant, guaranteed, free, proven, exclusive?

---

## Step 3 — SEO/GEO/AEO Self-Audit (run on every new page)

- [ ] Page has a unique `<title>` tag
- [ ] Page has a `<meta description>` (150-160 chars)
- [ ] Single `<h1>` on page
- [ ] Canonical URL set
- [ ] JSON-LD schema added for page type
- [ ] `llms.txt` updated with new page/content
- [ ] Page content answers a real question a prospect would ask an AI
- [ ] Open Graph tags complete

---

## Step 4 — Web 4.0 Compliance Check

- [ ] Voice/conversational UI reachable from this page
- [ ] Ambient trigger present (scroll, idle, or exit intent)
- [ ] At least one link back to Jenny/demo
- [ ] No dead links (`href="#"`)
- [ ] All anchor links resolve to actual IDs on target page
- [ ] All stats are honest and verifiable

---

## Step 5 — QA Self-Audit (run LAST, before every build)

```bash
# Build must succeed before deploy
npm run build
```

If build fails → FIX IT before proceeding. Never deploy a broken build.

Check list after build:

- [ ] Build exits with code 0 (✓ Compiled successfully)
- [ ] No TypeScript errors (only warnings acceptable)
- [ ] New routes appear in the build output
- [ ] No `href="#"` remaining in any new code written this session
- [ ] Every footer link resolves to a real page or real anchor
- [ ] Security page deep links tested: `/security#google-cloud`, `/security#hipaa`, `/security#no-data-training`, `/security#gdpr`

---

## Step 6 — Deploy

Only after Steps 1-5 pass:

```bash
firebase deploy --only hosting
```

Confirm: `✔ Deploy complete!` before reporting done to user.

---

## ANTIGRAVITY STANDING ORDERS

These apply to EVERY session, whether or not the user asks:

1. **Run the neuro-audit** on every page modified — don't wait to be asked
2. **Fix dead links** the moment you see them — don't wait to be asked
3. **Check anchor IDs** whenever you create a deep link — test it makes sense
4. **Never deploy broken stats** — if a number can't be verified, remove or label it
5. **Read the neuro skill** before touching any copy or CTA
6. **The user approves direction; you execute** — don't ask for permission to fix obvious issues
7. **Report proactively** — after each deploy, list what was checked and what was flagged
