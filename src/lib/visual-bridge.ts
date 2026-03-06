// ═══════════════════════════════════════════════════════════════════════════
// VISUAL BRIDGE — Event Bus Between Voice Jenny & Visual Jenny
// ═══════════════════════════════════════════════════════════════════════════
//
// PURPOSE: Decoupled communication layer between the two Jennys.
// Voice Jenny (VoiceOrchestrator) emits conversation events.
// Visual Jenny (VisualJenny) listens and autonomously responds with visuals.
//
// ARCHITECTURE:
//   Voice Jenny → VisualBridge.emit() → Visual Jenny.onEvent()
//   Visual Jenny → VisualBridge.emitVisualCommand() → VaultUI renders
//
// EVENT TYPES:
//   Conversation Events (from Voice Jenny):
//     - name_captured: Prospect gave their name
//     - domain_captured: Prospect gave their website URL
//     - audit_started: Business audit tool initiated
//     - audit_complete: Audit results returned
//     - phase_change: Conversation phase transitioned
//     - topic_change: Conversation topic shifted
//     - handoff: Agent handoff occurred
//     - close_attempt: Close sequence initiated
//     - agent_speech: Agent spoke (text transcript)
//     - prospect_speech: Prospect spoke (transcription)
//     - tool_call: Any tool was called
//     - data_point: A statistic or number was mentioned
//
//   Visual Commands (from Visual Jenny → UI):
//     - show_image: Display an image/visual
//     - navigate_section: Scroll to website section
//     - highlight_element: Draw attention to UI element
//     - show_overlay: Display informational overlay
//     - clear_visual: Clear the current visual
// ═══════════════════════════════════════════════════════════════════════════

export type ConversationEventType =
    | "name_captured"
    | "domain_captured"
    | "audit_started"
    | "audit_complete"
    | "phase_change"
    | "topic_change"
    | "handoff"
    | "close_attempt"
    | "agent_speech"
    | "prospect_speech"
    | "tool_call"
    | "data_point"
    | "session_start"
    | "session_end"
    | "competitor_intel"
    | "roi_calculated"
    | "checkout_triggered";

export type VisualCommandType =
    | "show_image"
    | "navigate_section"
    | "highlight_element"
    | "show_overlay"
    | "clear_visual"
    | "show_loading"
    | "show_stats_card"
    | "show_comparison";

export interface ConversationEvent {
    type: ConversationEventType;
    data: Record<string, unknown>;
    timestamp: number;
    sessionId: string;
    agentName?: string;
}

export interface VisualCommand {
    type: VisualCommandType;
    payload: {
        imageUrl?: string;
        imageDataUrl?: string;
        sectionId?: string;
        elementSelector?: string;
        overlayContent?: string;
        brainLayer?: string;
        neuroReason?: string;
        title?: string;
        subtitle?: string;
        stats?: Record<string, string | number>;
        duration?: number; // ms to display before auto-clear
        transition?: "fade" | "slide" | "zoom" | "pulse";
    };
    timestamp: number;
}

type ConversationListener = (event: ConversationEvent) => void;
type VisualCommandListener = (command: VisualCommand) => void;

class VisualBridgeClass {
    private conversationListeners: ConversationListener[] = [];
    private visualCommandListeners: VisualCommandListener[] = [];
    private eventHistory: ConversationEvent[] = [];
    private maxHistory = 50;

    // ── Conversation Events (Voice Jenny → Visual Jenny) ──────────────

    /** Voice Jenny calls this to emit conversation events */
    emitConversationEvent(event: ConversationEvent): void {
        // Store in history
        this.eventHistory.push(event);
        if (this.eventHistory.length > this.maxHistory) {
            this.eventHistory.shift();
        }

        console.log(`[VisualBridge] 📡 Event: ${event.type} | agent: ${event.agentName || "system"} | data: ${JSON.stringify(event.data).slice(0, 100)}`);

        // Notify all listeners
        for (const listener of this.conversationListeners) {
            try {
                listener(event);
            } catch (err) {
                console.warn("[VisualBridge] Listener error:", err);
            }
        }
    }

    /** Visual Jenny subscribes to conversation events */
    onConversationEvent(listener: ConversationListener): () => void {
        this.conversationListeners.push(listener);
        return () => {
            this.conversationListeners = this.conversationListeners.filter(l => l !== listener);
        };
    }

    // ── Visual Commands (Visual Jenny → VaultUI) ─────────────────────

    /** Visual Jenny calls this to issue visual commands */
    emitVisualCommand(command: VisualCommand): void {
        console.log(`[VisualBridge] 🎨 Visual: ${command.type} | ${command.payload.title || command.payload.sectionId || "image"}`);

        for (const listener of this.visualCommandListeners) {
            try {
                listener(command);
            } catch (err) {
                console.warn("[VisualBridge] Visual command listener error:", err);
            }
        }
    }

    /** VaultUI subscribes to visual commands */
    onVisualCommand(listener: VisualCommandListener): () => void {
        this.visualCommandListeners.push(listener);
        return () => {
            this.visualCommandListeners = this.visualCommandListeners.filter(l => l !== listener);
        };
    }

    // ── Utilities ────────────────────────────────────────────────────

    /** Get recent conversation context for Visual Jenny's decision making */
    getRecentContext(count = 10): ConversationEvent[] {
        return this.eventHistory.slice(-count);
    }

    /** Get all events of a specific type */
    getEventsByType(type: ConversationEventType): ConversationEvent[] {
        return this.eventHistory.filter(e => e.type === type);
    }

    /** Check if a specific event has occurred */
    hasEvent(type: ConversationEventType): boolean {
        return this.eventHistory.some(e => e.type === type);
    }

    /** Get the most recent event of a specific type */
    getLastEvent(type: ConversationEventType): ConversationEvent | null {
        const events = this.getEventsByType(type);
        return events.length > 0 ? events[events.length - 1] : null;
    }

    /** Clear all history (on session end) */
    reset(): void {
        this.eventHistory = [];
        console.log("[VisualBridge] 🔄 Bridge reset");
    }
}

// Singleton — shared between Voice Jenny and Visual Jenny
export const VisualBridge = new VisualBridgeClass();
