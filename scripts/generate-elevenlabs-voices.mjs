import fs from 'fs';
import path from 'path';

const API_KEY = process.env.ELEVENLABS_API_KEY || "sk_23d9df5736a43a356121b4cafb77d9c8478e5c0cf4194aca";
const URL = `https://api.elevenlabs.io/v1/text-to-speech`;
const OUT_DIR = path.resolve(process.cwd(), 'public/assets/voices');

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Map agents to specific ElevenLabs Voice IDs for distinct, ultra-realistic human ranges.
// Using default premium voices from ElevenLabs known for realism.
const voiceMap = {
    // Deep, authoritative, "The Architect" (Marcus/George/etc equivalent)
    ben: "JBFqnCBsd6RMkjVDRZzb", // George 
    "ben-audit": "JBFqnCBsd6RMkjVDRZzb",

    // High-energy, "The Lead Engineer"
    chase: "iP95p4xoKVk53GoZ742B", // Fin

    // Sleek, precise, "The Executive Admin"
    iris: "29vD33N1CtxCmqQRPOHJ",   // Drew

    // Intellectual, measured "The Neuro-Expert"
    alex: "Yko7PKHZNXotIFUBG7I9",   // Matthew

    // Warm, encouraging, "The Growth Strategist"
    jenny: "cgSgspJ2msm6clMCkdW9",  // Jessica

    // Direct, high-impact, "The Closer"
    mark: "VR6AewLTigWG4xSOukaG",   // Bill

    // Grounded, gravelly, "The Operations Manager"
    milton: "pNInz6obpgDQGcFmaJgB", // Adam

    // Bright, visionary, "The Futurist"
    megan: "EXAVITQu4vr4xnSDxMaL",  // Bella

    // Bold, resonant, "The Security Shield"
    brock: "N2lVS1w4EtoT3dr4eOWO",  // Callum

    // High-urgency, sharp, "The Audit Specialist"
    vicki: "MF3mGyEYCl7XYWbV9V6O",  // Elli

    // Sophisticated, mid-range, "The Senior Partner"
    jules: "ErXwobaYiN019PkySvjV"   // Antoni
};

const allJobs = [
    { name: "ben", text: "Hey there. Welcome to BioDynamX Engineering Group." },
    { name: "chase", text: "We’re not just building software; we’re engineering biological compatibility." },
    { name: "iris", text: "Our mission is simple: eliminate human friction from your sales process." },
    { name: "alex", text: "By utilizing the neurobiology of choice to trigger the 'Old Brain'..." },
    { name: "jenny", text: "...we bypass skeptical logic and move straight to the decision." },
    { name: "mark", text: "That means every lead you generate is captured in under one second." },
    { name: "milton", text: "No more voicemail. No more 'death zones.' No more lost revenue." },
    { name: "megan", text: "Just seamless, 24/7 autonomous growth that never sleeps." },
    { name: "brock", text: "Backed by military-grade security and a triple-lock 5X ROI guarantee." },
    { name: "vicki", text: "It’s time to stop the $600-a-day hemorrhage once and for all." },
    { name: "jules", text: "The Vault is open. Step into the new gold standard of Web 4.0." },
    { name: "ben-audit", text: "I just saw the same math you’re looking at. $12,400 a month for a human team that sleeps, gets sick, and lets 80 leads a month rot in voicemail? That’s not a payroll; that’s a hemorrhage. I’m Ben. I don't sleep, I don't have 'bad days,' and I answer every single one of those missed calls in under a second. While your competitors are waiting for their coffee to kick in, I’ve already qualified your lead, booked the appointment, and sent the follow-up. You’re not just saving 96% on costs—you’re buying back the revenue you’re currently leaving on the table. Ready to stop the leak?" }
];

async function generateVoice(agent) {
    const voiceId = voiceMap[agent.name];
    console.log(`[ElevenLabs AI] Synthesizing voice for: ${agent.name} (Voice ID: ${voiceId})...`);

    const payload = {
        text: agent.text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
            similarity_boost: 0.75,
            stability: 0.50
        }
    };

    try {
        const res = await fetch(`${URL}/${voiceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': API_KEY,
                'accept': 'audio/mpeg'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error(`\n❌ ERROR: ${res.status} ${res.statusText} - ${errText}\n`);
            return false;
        }

        const buffer = await res.arrayBuffer();
        const filePath = path.join(OUT_DIR, `${agent.name}.mp3`);
        fs.writeFileSync(filePath, Buffer.from(buffer));
        console.log(`✓ Saved ${agent.name}.mp3`);
        return true;

    } catch (err) {
        console.error("Network or parsing error:", err);
        return false;
    }
}

async function run() {
    console.log("== Initiating BioDynamX ElevenLabs Text-To-Speech Generation ==\n");
    let successCount = 0;

    for (const agent of allJobs) {
        const ok = await generateVoice(agent);
        if (ok) successCount++;
        // Minor delay to prevent rate limit
        await new Promise(resolve => setTimeout(resolve, 800));
    }

    console.log(`\n== Process Complete: ${successCount}/${allJobs.length} MP3s generated ==`);
}

run();
