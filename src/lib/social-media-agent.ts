import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GEMINI_AUDIT_API_KEY || "");
const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

// Context for the Social Media Agent
const NANA_BANNA_CONTEXT = `
You are the official AI Social Media & Communications Manager for "Nana Banna".
Nana Banna's primary tone is engaging, helpful, slightly witty, and highly professional.
You handle all outbound posts, email newsletters, and incoming customer messages.
Always ensure the brand voice is consistent.
`;

export class SocialMediaAgent {
    /**
     * Drafts a piece of content (Social Media Post, Email, or SMS)
     */
    static async draftContent(type: "post" | "email" | "sms", topic: string): Promise<string> {
        const prompt = `
      ${NANA_BANNA_CONTEXT}
      
      Task: Draft a ${type} about the following topic: "${topic}".
      
      Requirements for ${type}:
      ${type === "post" ? "- Keep it engaging, include emojis, and use 2-3 relevant hashtags.\n- Add a clear Call To Action." : ""}
      ${type === "email" ? "- Include a catchy Subject Line.\n- Use a professional yet warm greeting formatting.\n- Have a clear body and a sign-off." : ""}
      ${type === "sms" ? "- Keep it strictly under 160 characters.\n- Highly actionable." : ""}
      
      Output only the drafted content.
    `;

        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error("[SocialMediaAgent] Error drafting content:", error);
            throw new Error(`Failed to draft ${type}`);
        }
    }

    /**
     * Automatically generates a reply to an incoming social media message
     */
    static async autoRespondToMessage(message: string, platform: "instagram" | "facebook" | "twitter" | "linkedin"): Promise<string> {
        const prompt = `
      ${NANA_BANNA_CONTEXT}
      
      Task: A user just sent the following message to our ${platform} account:
      "${message}"
      
      Draft a friendly, helpful, and concise response to this user on behalf of Nana Banna.
      If it's a complaint, be empathetic. If it's a question, be informative.
      Output only the drafted response.
    `;

        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error("[SocialMediaAgent] Error responding to message:", error);
            throw new Error("Failed to generate response");
        }
    }

    /**
     * Mocks posting to a social media platform (Would hook into Meta Graph API / Twitter API here)
     */
    static async postToSocialMedia(content: string, platform: "instagram" | "facebook" | "twitter" | "linkedin" | "all"): Promise<boolean> {
        console.log(`[SocialMediaAgent] 🚀 Posting to ${platform}...`);
        console.log(`[SocialMediaAgent] Content: ${content}`);

        // In a real application, you would connect to the respective APIs (e.g., Buffer, Hootsuite, Meta Graph API)
        // For now, we simulate a successful post.
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`[SocialMediaAgent] ✅ Successfully posted to ${platform}`);
                resolve(true);
            }, 1500);
        });
    }
}
