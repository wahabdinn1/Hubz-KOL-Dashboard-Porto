# Hubz KOL Dashboard

A **Neo-Brutalist** Influencer Management & Analytics Dashboard built for the modern marketing era.

## ✨ Features

### 📊 Dashboard & Analytics

- Real-time revenue & spend tracking
- Profitability metrics and ROI calculations
- Campaign performance analytics
- Finance command center

### 👥 KOL Management

- Detailed influencer profiles with engagement rates
- Auto-fetch TikTok & Instagram profiles
- Tiering system (Nano, Micro, Macro, Mega)
- Content library with embedded media
- Performance history tracking

### 📋 Campaign Operations

- Kanban task board with drag-and-drop
- Gantt chart timeline view
- Calendar view for scheduling
- Deliverables tracking
- AI Smart Match for influencer recommendations

### 💰 Finance & Invoicing

- Invoice creation and management
- Status workflows (Draft → Paid)
- PDF generation
- Budget utilization tracking

### 🔧 Tools

- **Profile Lookup**: Fetch TikTok & Instagram profiles with platform tabs
- **TikTok Trending**: Browse trending videos and creators
- **Video Info**: Get TikTok video details
- **ER Calculator**: Engagement rate calculator

### 🎨 Design System

- Neo-Brutalist RetroUI components
- Vibrant color palette (#FFDA5C primary)
- Dark mode support
- Responsive design

### ⌨️ Productivity

- Command palette (`Ctrl+K`)
- Keyboard shortcuts
- Global date filtering
- Quick actions

---

## 🛠 Tech Stack

| Category   | Technology                   |
| ---------- | ---------------------------- |
| Framework  | Next.js 16 (App Router)      |
| Styling    | Tailwind CSS v4 + Shadcn UI  |
| Database   | Supabase (PostgreSQL & Auth) |
| TikTok API | @tobyg74/tiktok-api-dl       |
| Instagram  | Custom JS scraper            |
| Charts     | Recharts                     |
| Forms      | React Hook Form + Zod        |

---

## ⚡ Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📦 Deployment

Deploy to Vercel:

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

---

## 📄 License

MIT License © 2026 Wahabdinn
