# MemorEase - Product Requirements Document

## Overview
MemorEase is a gamified study ecosystem combining Spaced Repetition with RPG progression and Zen focus. Built with Vite + React + TypeScript + Supabase.

## Tech Stack
- **Frontend**: Vite + React 19 + TypeScript + Tailwind CSS v4
- **Backend**: Supabase (Auth, Database, Storage, Realtime)
- **AI**: Google Gemini (Socratic Interrogation)
- **Charts**: Recharts | **Animation**: Motion | **Icons**: Lucide React

## What's Been Implemented

### Iteration 1
- Removed "View Demo" button, "Google Neural Auth" -> "Google Sign In"
- Password eye toggle, removed Global Ranking, subject images
- Flocus-like Focus Timer (3 modes, 8 presets, sliders, ambience)

### Iteration 2
- Delete Directory fix (storage list+remove with RLS logging)
- New rank system (Novice->Eternal, 11 tiers)
- LeetCode heatmap, dynamic notifications, Study Load Distribution fix
- Triage Mode, Magic Drop, Distraction Interceptor, Class Raid Widget

### Iteration 3
- Fixed dashboard widget layout overflow
- Moved heatmap from Profile to Metrics (ActivityHeatmap component)
- Added real ambient audio (Rain, Lo-Fi, Waves, Forest, Night via Pixabay CDN)
- Connected Class Raids to Supabase class_raids table with mock fallback
- Added actual quiz content for Distraction Interceptor

### Iteration 4 (Current)
- **Removed features from Metrics tab**: Triage, Interceptor, Raid, Heatmap all removed from metrics/overview tab (were causing broken layout)
- **Renamed "New Chapter" -> "Add Notes"** in Vault
- **Renamed "New Directory" -> "New Subject"** in Vault input
- **Fixed "Initialize Focus Session"** button to redirect to Focus tab via onJumpToFocus
- **Simplified OverviewView** - clean metrics only (Study Load Distribution + Active Subjects)

## Available Components (Not Yet Placed)
- TriageModeWidget - Panic button for fading topics
- DistractionInterceptor - Tab-switch flashcard modal (+50 XP)
- ClassRaidWidget - Cooperative raid boss battles
- ActivityHeatmap - LeetCode-style yearly grid

## Prioritized Backlog
### P1: Re-integrate features in proper locations (sidebar, separate tab, or floating widgets)
### P2: Profile tab content per user spec, level booster mechanics
### Future: Multiplayer sync, push notifications, mobile responsive
