---
description: How to deploy the BioDynamX application to production (biodynamx.com via Firebase)
---

# Deployment Workflow

## IMPORTANT: Deployment Rules

- **DO NOT** push to Git or use Vercel. Ever.
- **DO NOT** suggest `git push` or Vercel deploys.
- All deployment goes through **Firebase Hosting** only.
- The production site is **biodynamx.com** hosted on Firebase project **bio-dynamx**.

## Steps

1. Build the Next.js application:

```bash
cd /Users/bdlt/MasterBioDynamX/biodynamx-voice-engine
npm run build
```

1. Deploy to Firebase (biodynamx.com):
// turbo

```bash
cd /Users/bdlt/MasterBioDynamX/biodynamx-voice-engine
firebase deploy --only hosting
```

## Firebase Configuration

- **Site**: `bio-dynamx`
- **Region**: `us-central1`
- **Config file**: `firebase.json`
- **Framework**: Next.js (Firebase frameworks backend)

## Environment Variables

- Local development uses `.env.local`
- Production environment variables must be set in **Firebase** (not Vercel)
- Use `firebase functions:config:set` for server-side secrets if needed

## Notes

- The old static `og-image.png` is kept as a fallback in `/public/`
- Dynamic OG images are generated via `src/app/opengraph-image.tsx` and `src/app/twitter-image.tsx`
- Git commits are fine for version tracking locally, but deployment is ALWAYS via `firebase deploy`
