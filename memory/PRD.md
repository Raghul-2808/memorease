# MemorEase - Product Requirements Document

## Overview
MemorEase is a gamified study ecosystem combining Spaced Repetition with RPG progression and Zen focus. Built with Vite + React + TypeScript + Supabase.

## Tech Stack
- **Frontend**: Vite + React 19 + TypeScript + Tailwind CSS v4
- **Backend**: Supabase (Auth, Database, Storage, Realtime)
- **AI**: Google Gemini (Socratic Interrogation)
- **Charts**: Recharts | **Animation**: Motion | **Icons**: Lucide React

## What's Been Implemented

### Iteration 1 (Jan 2026)
- Removed "View Demo" button, "Google Neural Auth" -> "Google Sign In"
- Password visibility toggle (Eye/EyeOff) in login/signup
- Removed Global Ranking from overview
- 10 aesthetic subject-specific images
- Enhanced notifications with emojis
- Ranking system icons for all tiers
- Retention Curve & Neural Load moved to Metrics tab
- Flocus-like Focus Timer (3 modes, 8 presets, sliders, ambience)

### Iteration 2 (Jan 2026) 
- **Delete Directory Fix**: Uses `supabase.storage.list()` then `.remove()` with RLS error logging
- **New Rank System**: Novice->Apprentice->Scholar->Adept->Sage->Virtuoso->Luminary->Archon->Transcendent->Omniscient->Eternal (much harder XP thresholds)
- **LeetCode-Style Heatmap**: Monthly activity grid with intensity levels, active days, max streak, month labels
- **Dynamic Notifications**: Generated from actual user data (streak, topic progress, XP, rank)
- **Fixed Study Load Distribution**: Proper pie chart with labels, colors, empty states
- **Fixed Active Subjects**: Progress bars, subject images, proper alignment
- **Feature 1: Triage Mode** - Red panic button on dashboard, rapid-fire flashcard UI for fading topics
- **Feature 2: Magic Drop** - Drag-and-drop zone in Vault, auto-parses text into quest node cards
- **Feature 3: Distraction Interceptor** - Glassmorphic modal on tab switch, +50 XP for correct recall
- **Feature 4: Class Raid Widget** - Dashboard widget with raid boss HP bars, cooperative study battles (MOCKED data)

## Prioritized Backlog
### P0 - None
### P1
- Profile tab content (user to specify)
- Class Raid: Connect to actual Supabase `class_raids` table
- Level booster mechanics
### P2
- Global Rankings (deferred)
- Custom subject images from user
- Ambience audio playback
- Distraction Interceptor: actual quiz/flashcard content from topics
### Future
- Multiplayer real-time sync for raids
- Push notifications (browser)
- Mobile responsive polish
