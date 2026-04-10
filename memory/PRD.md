# MemorEase - Product Requirements Document

## Overview
MemorEase is a gamified, minimalist study ecosystem combining Spaced Repetition with RPG progression and Zen focus. Built with Vite + React + TypeScript frontend with Supabase backend.

## Tech Stack
- **Frontend**: Vite + React 19 + TypeScript + Tailwind CSS v4
- **Backend**: Supabase (Auth, Database, Storage, Realtime)
- **AI**: Google Gemini (Socratic Interrogation feature)
- **Charts**: Recharts
- **Animation**: Motion (Framer Motion)
- **Icons**: Lucide React

## Core Architecture
- Single-page app with views: Auth, Overview/Metrics, Focus, Vault, Profile, Notifications
- Supabase tables: users, subjects, topics, notifications
- Supabase storage: app-files bucket for user uploads and avatars
- Realtime subscriptions for live data updates

## What's Been Implemented (Jan 2026)

### Enhancement Session - Changes Made:
1. **Landing Page** - Removed "View Demo" button, kept only "Get Started Free"
2. **Auth Forms** - Changed "Google Neural Auth" to "Google Sign In" in login/signup
3. **Password Visibility** - Added eye icon toggle (Eye/EyeOff) for password fields in login and signup
4. **Global Ranking Removed** - Removed Global Rank card from Overview, replaced with Total XP card
5. **Subject Images** - Added 10+ aesthetic subject-specific images (Math, Physics, Chemistry, Biology, CS, History, English, Geography, Psychology, Economics)
6. **Vault Directory Deletion** - Already had confirmation modal, verified working
7. **Enhanced Notifications** - Added 10 engagement notifications with emojis (memory decay alerts, streak notifications, milestone achievements, study reminders, daily goals, level up alerts, pro tips)
8. **Ranking System Icons** - Added distinct icons for each rank tier (Iron→Shield, Bronze→Shield, Silver→Shield, Gold→Medal, Platinum→Trophy, Diamond→Gem, Ascendant→Sparkles, Radiant→Crown) with gradient colors
9. **Metrics Dashboard** - Moved Retention Curve chart and Neural Load Distribution pie chart from Profile to Overview/Metrics tab
10. **Profile Rank Progression** - Replaced old charts with visual Rank Progression grid showing all 8 rank tiers with unlock states
11. **Focus Timer Customization (Flocus-like)**:
    - 3 Timer Modes: Pomodoro, Countdown, Stopwatch
    - Quick time presets: 15, 25, 30, 45, 50, 60, 90, 120 minutes
    - Custom duration sliders: Focus time (5-120min), Short break (1-30min), Long break (5-60min)
    - Sessions before long break selector (2-8)
    - Pomodoro session counter with visual dots
    - Enhanced ambience: 6 options (None, Rain, Lo-Fi, Waves, Forest, Night) with icons
    - Hardcore mode with fullscreen lock

## Prioritized Backlog
### P0 (Critical)
- None currently

### P1 (High)
- User requested: "retention curve and neural load can be moved to metrics tab and ill tell u later what to add in profile tab" - Profile tab content TBD
- User mentioned: ranking icons and level boosters (icons done, boosters TBD)

### P2 (Medium)
- Global Rankings feature (deferred by user, can add later)
- Custom subject images (user will provide later)
- More notification types based on actual user behavior
- Sound playback for ambience options in Focus timer

### Next Tasks
- Await user feedback on Profile tab content
- Implement actual ambience audio playback
- Add level booster mechanics
- User-provided subject images replacement
