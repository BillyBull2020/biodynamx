---
description: TRIPLE-LOCK STABILITY PROTOCOL — Use this for all voice engine modifications
---

# TRIPLE-LOCK STABILITY PROTOCOL (PROMPT ENGINEERING EXPERT MODE)

This is a mandatory operational directive for the Antigravity team. Follow every step to a T. No fluff. No placeholders. Just structural integrity.

## 1. Ground Truth Discovery
Before claiming a fix, you MUST verify the environment.
- Run `curl` against the Gemini API `listModels` endpoint using the actual active key to retrieve the EXACT strings supported by Google’s backend right now. 
- If the model string in the code does not match the curl response exactly, it is a failure.

## 2. Protocol Enforcement
- Model Pinning: Use `gemini-2.0-flash-exp` if `gemini-2.5` strings fail discovery. Stability > Version Number.
- Endpoint Locking: Use `v1alpha` for experimental features and `v1beta` for stable multimodal. Align the model to the endpoint.
- Sanitization: Scrub all system instructions for `[]` placeholders and hallucinated variable names.

## 3. The "Name Lock" Execution
- The agent is forbidden from speaking until the `captureLead` tool returns success OR the user provides a transcript containing a name.
- Logic: `if (isWaitingForName && !nameInState) { return silence; }`

## 4. Verification Workflow
- `npm run build` must pass.
- `firebase deploy` must pass.
- Manually check the live URL logs for `Code 1008`.

## 5. Reporting
- Do not say "fixed" until you have the CURL output and the BUILD output in your console.
- If a step fails, report the specific error code, not a summary.
