"use client";

import VaultUI from "@/components/VaultUI";

export default function RealEstatePage() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    return <VaultUI apiKey={apiKey} />;
}
