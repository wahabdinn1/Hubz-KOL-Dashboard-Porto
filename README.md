# Hubz Porto KOL

A **Neo-Brutalist** Influencer Management & Analytics Dashboard built for the modern marketing era. It combines high-impact aesthetics with powerful campaign tracking logic.

![Dashboard Overview](public/screenshots/dashboard.png)

## 🚀 Key Features

### 1. Neo-Brutalist Design System
A custom "Pop" design system featuring:
- **Vibrant Palette**: Primary Yellow (`#FFDA5C`), Stark Black, and Soft Cream.
- **Bold UI**: Thick 2px borders, hard shadows, and high-contrast typography.
- **Split-View Auth**: Custom Login/Register pages that break the mold of standard SaaS templates.

![Login Page](public/screenshots/login.png)

### 2. Campaign Intelligence & AI Matchmaker
Track marketing initiatives with precision. Currently featuring:
- **AI Smart Match**: Automatically ranks influencers based on your campaign's specific objective, budget, and category overlap.
- **Conversion Campaigns**: Focus on **ROAS (Return on Ad Spend)** and **CVR (Conversion Rate)**.
- **Awareness Campaigns**: Focus on **CPM (Cost Per Mille)** and **Virality Rate** (Shares/Views).
- **Efficiency Score**: A proprietary metric tracking "Views per Rp 1,000 Spend".

![Analytics Detail](public/screenshots/analytics.png)

### 3. Workflow & Management
- **Kanban Board**: Drag-and-drop interface effectively manages creator status from "To Contact" to "Posted" and "Completed".
- **PDF Reporting**: Generate professional, client-ready campaign reports with a single click.
- **Profile Popups**: Quick-view cards for instant access to influencer stats and rates without leaving the table.

### 4. Influencer Management (KOLs)
Manage your roster of Creators with detailed profiles and new standard **Tiering System** (Nano, Micro, Macro, Mega):
- **Platform Stats**: Track Followers for TikTok & Instagram separately.
- **Rate Cards**: Manage different rates for Reels, TikToks, and Stories.
- **Directory**: Sort, filter, and quick-edit your influencers.

![Influencer Directory](public/screenshots/influencers.png)

### 5. Enterprise Controls
- **RBAC (Role-Based Access Control)**: Granular permissions for Super Admirns (System access) vs. regular Admins (Campaign access).
- **Delete Confirmation**: Critical actions (deleting campaigns or influencers) are protect by custom confirmation dialogs.
- **Security**: Secure password updates via settings.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL & Auth)
- **State Management**: React Context + TanStack Query
- **Features**: `@dnd-kit` (Kanban), `@react-pdf/renderer` (Reporting), `sonner` (Toasts)
- **Visuals**: Lucide React Icons & Recharts

## ⚡ Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Create a `.env` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 📦 Optimization

- **Fast Loading**: Enabled `gzip` compression and Next.js Image Optimization.
- **Clean Architecture**: Separation of Server Components and Client Interactivity.

---
*Built by Antigravity for Hubz Porto.*
