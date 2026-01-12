# Hubz Porto KOL

A Neo-Brutalist Influencer Management & Analytics Dashboard.

## Features

- **Neo-Brutalist Design**: Vibrant "Pop" palette (Yellow/Black/Cream), thick borders, and hard shadows.
- **Campaign Management**: Create, edit, and track marketing campaigns.
- **Influencer Directory**: Manage KOLs with TikTok/Instagram stats and rate cards.
- **Advanced Analytics**:
  - **ROI & ROAS** calculations.
  - **Virality Rate** & **CVR** tracking.
  - **Efficiency Score** (Views per Spend).
  - **Dynamic Success Metrics**: Auto-adapts based on campaign objective.
- **Secure Authentication**: Supabase with custom Neo-Brutalist Login/Register pages.
- **Settings**: Manage categories, profile, and security (password updates).
- **Safe Operations**: Confirmation dialogs for all critical delete actions.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Shadcn UI (Customized)
- **Database**: Supabase (PostgreSQL)
- **State**: React Context (`DataContext`)
- **Icons**: Lucide React
- **Charts**: Recharts (RetroUI Area Chart)

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Setup Environment**:
   Create `.env` with Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```
3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Optimization

- **Fast Loading**: Optimized images and compression enabled.
- **Modern Standards**: React Server Components & efficient client-side state.
