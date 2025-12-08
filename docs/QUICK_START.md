# Quick Start Guide - 5 Minutes to Working App

## 1. Export from v0 (30 seconds)
- Click three dots (⋯) in top-right → "Download ZIP"
- Extract and open in VS Code

## 2. Run Database Scripts (1 minute)
1. Go to [supabase.com](https://supabase.com) → Your Project → SQL Editor
2. Copy `scripts/001_create_tables.sql` → Paste → Run
3. Copy `scripts/002_seed_data.sql` → Paste → Run

## 3. Set Up Environment (2 minutes)
1. In Supabase: Settings → API → Copy URL and anon key
2. Create `.env.local` in your project root:
\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
\`\`\`

## 4. Install & Run (1 minute)
\`\`\`bash
npm install
npm run dev
\`\`\`

## 5. Open App
→ [http://localhost:3000](http://localhost:3000)

🎉 **Done!** You should see your dashboard with 3 sample plants.

---

## What's Next?

- **Deploy**: Click "Publish" in v0 or push to Vercel
- **Add Plants**: Go to `/settings` to add your own plants
- **Connect Hardware**: See `docs/ESP32_API_GUIDE.md` for ESP32 setup
- **Full Guide**: See `docs/SETUP_GUIDE.md` for complete instructions
