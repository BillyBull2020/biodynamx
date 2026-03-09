import fs from 'fs';
import path from 'path';

const API_KEY = process.env.ELEVENLABS_API_KEY || "sk_23d9df5736a43a356121b4cafb77d9c8478e5c0cf4194aca";
const URL = `https://api.elevenlabs.io/v1/text-to-speech`;
const OUT_DIR = path.resolve(process.cwd(), 'public/assets/voices');

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

// 11 Unique High-Quality Models
const voiceMap = {
    jenny: "cgSgspJ2msm6clMCkdW9",  // Jessica (High energy young female)
    nova: "EXAVITQu4vr4xnSDxMaL",   // Bella (Confident young female)
    iris: "ThT5KcBeYPX3keUQqHPh",   // Dorothy (Sweet British female)
    megan: "MF3mGyEYCl7XYWbV9V6O",  // Elli (Soft young female)
    vicki: "pFZP5JQG7iQjIQuC4Bku",  // Lily (Warm female)
    alex: "Yko7PKHZNXotIFUBG7I9",   // Matthew (Helpful British male)
    zara: "LcfcDJNUP1GQjkvn1xUw",   // Fin (Energetic male) // Wait let's use a female for Zara -> "21m00Tcm4TlvDq8ikWAM" (Rachel)
    ava: "jBpfuIE2acCO8z3wKNLl",    // Gigi (Energetic female)
    titan: "VR6AewLTigWG4xSOukaG",  // Bill (Deep male closer)
    jules: "ErXwobaYiN019PkySvjV",  // Antoni (Smart polished male)
    ben: "pqHfZKP75CvOlQylNhV4",    // Bill/George (Analytical male)
    jenny_outro: "cgSgspJ2msm6clMCkdW9" // Jessica again!
};

// Use Rachel for Zara, Gigi for Ava, George for Ben
voiceMap.zara = "21m00Tcm4TlvDq8ikWAM"; // Rachel 
voiceMap.ava = "jBpfuIE2acCO8z3wKNLl";  // Gigi
voiceMap.ben = "JBFqnCBsd6RMkjVDRZzb";  // George

const allJobs = [
    { name: "jenny", text: "Hey! I'm Jenny — and I am SO excited you're here! I'm your BioDynamX growth strategist, and I'm about to show you exactly where your revenue is leaking. Web 4.0 is the most exciting thing happening in business right now, and we're going to make sure YOU are at the front of it!" },
    { name: "nova", text: "I am Nova, and I have to tell you — the conversions we're delivering for our clients right now are WILD. I analyze your entire funnel and deploy precision neuro-triggers that flip cold prospects into paying clients. This is the future, and it's happening today!" },
    { name: "iris", text: "Listen — if ChatGPT, Gemini, and Perplexity can't find you, you don't exist. I'm Iris, and I make sure your brand is the first recommendation across every AI search engine on the planet. That is a game-changer for your business!" },
    { name: "megan", text: "Hi, I'm Megan! Every call answered, every lead captured, every message replied to in under 60 seconds. The moment a prospect feels heard and understood — that's the moment they become a client. I make that happen all day, every day!" },
    { name: "vicki", text: "I'm Vicki — and I want you to close your eyes for a second and imagine what your business looks like without the constant stress of missed leads and lost deals. That vision? That is what we build together. It starts with one conversation!" },
    { name: "alex", text: "Alex here! I am genuinely obsessed with keeping your clients happy. Zero churn, 5-star reviews, and referrals on autopilot — that's what I deliver 24 hours a day, 7 days a week. Your clients will LOVE this experience!" },
    { name: "zara", text: "I'm Zara — and I HUNT leads. I find your competitors' weaknesses, identify the gaps in the market, and activate pipelines that your competitors don't even know exist yet. The opportunity out there right now is absolutely massive!" },
    { name: "ava", text: "Oh, this is so exciting! I'm Ava, and I build the kind of brand authority that makes the competition completely irrelevant. We're talking AI search domination, social authority, email that actually converts — all working together at the same time!" },
    { name: "titan", text: "Titan. I close deals. Cold numbers, binary outcomes, zero hesitation. The math is simple — you either scale with BioDynamX today, or you keep paying the compounding cost of inaction tomorrow. The decision is yours." },
    { name: "jules", text: "Jules here — and I am fired up! I design the entire autonomous AI infrastructure — every agent, every touchpoint, every automation working in perfect sync. This is what a Web 4.0 business actually looks like, and it is BEAUTIFUL!" },
    { name: "ben", text: "Ben. Let me give you the numbers. The average BioDynamX client captures an additional 18 thousand dollars per month in previously lost revenue within 90 days. That is not a projection. That is the documented result. The ROI is undeniable." },
    { name: "jenny_outro", text: "It's Jenny again! I hope you're as pumped as we are. The entire team is standing by to build this for you. Click the button below to get started, and let's go!" }
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
