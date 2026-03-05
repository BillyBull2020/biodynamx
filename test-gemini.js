const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        contents: [
            {
                parts: [{ text: "A futuristic glowing city at night" }],
            },
        ],
        generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
        },
    }),
}).then(res => res.text()).then(t => console.log(t)).catch(console.error);
