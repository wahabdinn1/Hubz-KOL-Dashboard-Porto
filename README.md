# Hubz KOL Dashboard

A comprehensive Influencer Management & Analytics Dashboard built for the modern marketing era.

## Features

### Dashboard & Analytics

- Real-time revenue & spend tracking
- Profitability metrics and ROI calculations
- Campaign performance analytics
- Finance command center

### KOL Management

- Detailed influencer profiles with engagement rates
- Auto-fetch TikTok & Instagram profiles
- Tiering system (Nano, Micro, Macro, Mega)
- Performance history tracking

### KOL Scorecard Calculator

- **Real Experience Score**: Calculate value based on recent video views.
- **Median Analysis**: Uses the median views of the last 10 videos for accuracy.
- **CPM Assessment**: Determines if an influencer is "Super Worth It", "Fair", or "Overpriced".
- **Shareable Output**: Generate professional scorecards for internal review.

### Contract Management System

- **Contract Generator**: Create legal agreements using pre-defined templates.
- **Template Editor**: Rich text editor with "Edit" and "Preview" modes.
- **Dynamic Variables**: Insert placeholders like `{SOW}` and `{FEE}` with a single click.
- **PDF Export**: Generate clean PDF contracts ready for signing.

### Campaign Operations

- Task management board
- Timeline views for scheduling
- Deliverables tracking
- AI Smart Match for influencer recommendations

### Finance & Invoicing

- Invoice creation and management
- Status workflows (Draft -> Paid)
- PDF generation
- Budget utilization tracking

### Tools

- **Profile Lookup**: Fetch TikTok & Instagram profiles
- **TikTok Trending**: Browse trending videos and creators
- **Video Downloader**: Get TikTok video info and downloads
- **Hashtag Search**: Discover videos by keyword

### Design System ("Neo-Brutalist Refresh")

- **RetroUI**: Custom design system featuring high contrast, bold borders (2px black), and sharp shadows (`shadow-hard`).
- **Typography**: Optimized for readability and impact.
- **Dark Mode**: Fully supported with consistent high-contrast styling.
- **Micro-Interactions**: Hover states, page transitions (`Framer Motion`), and dynamic feedback.

### Mobile Experience

- **Responsive**: Fully optimized for mobile devices.
- **App-Like Navigation**: Bottom navigation bar and redesigned mobile drawer.
- **Touch-Friendly**: Generous tap targets and card-based mobile views for complex data.

---

## Tech Stack

| Category  | Technology                   |
| --------- | ---------------------------- |
| Framework | Next.js 16 (App Router)      |
| Styling   | Tailwind CSS v4 + Shadcn UI  |
| Database  | Supabase (PostgreSQL & Auth) |
| Language  | TypeScript                   |
| Charts    | Recharts                     |
| Forms     | React Hook Form + Zod        |
| PDF       | React-PDF                    |

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## Deployment

Deploy to Vercel:

1.  Push to GitHub
2.  Import to Vercel
3.  Add environment variables
4.  Deploy

**Note**: Some TikTok features (like direct user posts via Puppeteer) may have limitations in serverless environments due to platform protections.

---

## License

MIT License © 2026 Wahabdinn
