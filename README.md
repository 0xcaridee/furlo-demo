# Furlo — AI pet care companion (demo)

Furlo is a pet care app prototype for Hong Kong dog owners. This repo is a **demo build**: it runs without a backend, uses a sample profile for my dog Teakha, and shows how an AI triage assistant could work.

> **Not veterinary advice.** All health content, place listings and the map are sample data for demonstration only.

## What to try

| Tab | What it shows |
| --- | --- |
| **Furlo AI** | A scripted triage chat for "Teakha vomited this morning": tap-to-answer follow-up questions, red-flag safety rules that stop the chat in an emergency, an urgency label, cited sources, and a "How Furlo AI decided" panel |
| **Home** | Teakha's profile, a rain-forecast walking tip, reminders and local events |
| **Map** | An illustrated Wan Chai map with pet-friendly cafés and parks, plus "Report an alert" for a lost dog or poison hazard |
| **Connect / Search** | Community groups and pet service listings |

## How the AI triage is designed

The chat is scripted, but it follows a retrieval-augmented generation (RAG) design with a rules layer in front:

1. **Understand**: turn the owner's taps and free text into structured details (symptom, colour, frequency, appetite, energy), combined with the pet's profile.
2. **Red-flag rules first**: vet-written rules (e.g. blood in vomit, retching with nothing coming up) escalate straight to "contact a vet now", so spotting an emergency never depends on the AI.
3. **Retrieve**: look up vet-approved knowledge-base passages instead of answering from memory.
4. **Answer from sources only**: give an urgency level (monitor at home / see a vet within 24 hours / emergency) with citations.
5. **Human in the loop**: low-rated answers go to a vet advisor, whose fixes update the rules, knowledge base and test set.

The logic lives in `lib/triage.ts`; the chat screen is `app/(tabs)/compawnion.tsx`.

## Run it locally

```bash
npm install
npm run dev          # Expo dev server
npm run build:web    # static web build in dist/
```

Demo mode is on by default (`lib/demo.ts`). To reconnect a real Supabase backend, set `DEMO_MODE = false` and add a `.env` file (never commit it):

```
EXPO_PUBLIC_SUPABASE_URL=<your-supabase-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

## Live demo

Every push to `main` builds the web app and publishes it to GitHub Pages via `.github/workflows/deploy.yml`. The demo page asks search engines not to index it.

## Tech stack

Expo (SDK 52), Expo Router, React Native Web, TypeScript, Lucide icons. Originally prototyped in bolt.new.
