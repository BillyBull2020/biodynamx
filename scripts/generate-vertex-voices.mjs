/**
 * BioDynamX: Vertex AI Voice Generation Script (Node.js)
 * Automatically generates 12 MP3 files using Google Cloud Text-to-Speech (Journey voices).
 * 
 * IMPORTANT: You must enable the API first by visiting:
 * https://console.developers.google.com/apis/api/texttospeech.googleapis.com/overview?project=762535336008
 */

import fs from 'fs';
import path from 'path';

// Load from .env.local via process.env if available, or fallback to the provided key
const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDmEWFQUvCpi7CdEPG740h_JWFScyeyTOU";
const URL = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`;
const OUT_DIR = path.resolve(process.cwd(), 'public/assets/voices');

// Ensure output directory exists
if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

// 1. The 11-Agent Relay Script
const carouselAgents = [
    { name: "ben", text: "Hey there. Welcome to BioDynamX Engineering Group.", voice: "en-US-Journey-D" }, // Deep, authoritative
    { name: "chase", text: "We’re not just building software; we’re engineering biological compatibility.", voice: "en-US-Journey-O" }, // High-energy
    { name: "iris", text: "Our mission is simple: eliminate human friction from your sales process.", voice: "en-US-Journey-F" }, // Sleek, precise
    { name: "alex", text: "By utilizing the neurobiology of choice to trigger the 'Old Brain'...", voice: "en-US-Journey-D" }, // Intellectual
    { name: "jenny", text: "...we bypass skeptical logic and move straight to the decision.", voice: "en-US-Journey-F" }, // Warm, encouraging
    { name: "mark", text: "That means every lead you generate is captured in under one second.", voice: "en-US-Journey-D" }, // Direct, high-impact
    { name: "milton", text: "No more voicemail. No more 'death zones.' No more lost revenue.", voice: "en-US-Journey-D" }, // Grounded
    { name: "megan", text: "Just seamless, 24/7 autonomous growth that never sleeps.", voice: "en-US-Journey-F" }, // Bright, optimistic
    { name: "brock", text: "Backed by military-grade security and a triple-lock 5X ROI guarantee.", voice: "en-US-Journey-O" }, // Bold, resonant
    { name: "vicki", text: "It’s time to stop the $600-a-day hemorrhage once and for all.", voice: "en-US-Journey-F" }, // Intense, clear
    { name: "jules", text: "The Vault is open. Step into the new gold standard of Web 4.0.", voice: "en-US-Journey-D" }  // Smooth, polished
];

// 2. The Ben Activation Script (The Audit Module)
const benAudit = {
    name: "ben-audit",
    text: "I just saw the same math you’re looking at. $12,400 a month for a human team that sleeps, gets sick, and lets 80 leads a month rot in voicemail? That’s not a payroll; that’s a hemorrhage. I’m Ben. I don't sleep, I don't have 'bad days,' and I answer every single one of those missed calls in under a second. While your competitors are waiting for their coffee to kick in, I’ve already qualified your lead, booked the appointment, and sent the follow-up. You’re not just saving 96% on costs—you’re buying back the revenue you’re currently leaving on the table. Ready to stop the leak?",
    voice: "en-US-Journey-D"
};

const allJobs = [...carouselAgents, benAudit];

async function generateVoice(agent) {
    console.log(`[Vertex AI] Synthesizing voice for: ${agent.name}...`);

    // Attempting generation with the advanced Vertex 'Journey' voice models
    const payload = {
        input: { text: agent.text },
        voice: { languageCode: "en-US", name: agent.voice },
        audioConfig: { audioEncoding: "MP3" }
    };

    try {
        const res = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.error) {
            console.error(`\n❌ ERROR: ${data.error.message}\n`);
            return false;
        }

        if (data.audioContent) {
            const buffer = Buffer.from(data.audioContent, 'base64');
            const filePath = path.join(OUT_DIR, `${agent.name}.mp3`);
            fs.writeFileSync(filePath, buffer);
            console.log(`✓ Saved ${agent.name}.mp3`);
            return true;
        }
    } catch (err) {
        console.error("Network or parsing error:", err);
        return false;
    }
}

async function run() {
    console.log("== Initiating BioDynamX Vertex AI Text-To-Speech ==\n");
    let successCount = 0;

    for (const agent of allJobs) {
        const ok = await generateVoice(agent);
        if (ok) successCount++;
        // Minor delay to prevent rate limit
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n== Process Complete: ${successCount}/${allJobs.length} MP3s generated ==`);
    if (successCount < allJobs.length) {
        console.log(`\nIMPORTANT: If you received a 'disabled' error, your Cloud Text-to-Speech API is turned off.`);
        console.log(`Activate it here: https://console.developers.google.com/apis/api/texttospeech.googleapis.com/overview?project=762535336008`);
        console.log(`Wait 2 minutes, then run 'node scripts/generate-vertex-voices.mjs' again.`);
    }
}

run();
