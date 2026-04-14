# Funeral Service Trainer

AI-powered study and practice tool for funeral service students.
Role-play scenarios · Flashcards · NBE Quiz · AI Instructor

---

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Add your Anthropic API key
```bash
cp .env.local.example .env.local
```
Open `.env.local` and replace the placeholder with your real key from https://console.anthropic.com/

### 3. Run the dev server
```bash
npm run dev
```
Open http://localhost:3000

---

## Deploy to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
gh repo create funeral-service-trainer --private --push --source=.
```
(Or create the repo on github.com and follow the push instructions)

### 2. Connect to Vercel
- Go to https://vercel.com/new
- Import your GitHub repository
- Click **Deploy** (default settings are fine for Next.js)

### 3. Add environment variable
In your Vercel project dashboard:
- Settings → Environment Variables
- Add: `ANTHROPIC_API_KEY` = your key from https://console.anthropic.com/
- Click Save, then **Redeploy**

That's it. Your app is live.

---

## Project Structure

```
app/
  page.tsx          ← main UI (all tabs: Home, Practice, Study, Ask, Progress)
  layout.tsx        ← root layout
  globals.css       ← minimal reset
  api/
    claude/
      route.ts      ← secure server-side Anthropic proxy
```

## Adding Content

- **Scenarios** — edit the `SCENARIOS` array in `app/page.tsx`
- **Flashcards** — edit the `FLASHCARDS` array
- **Quiz questions** — edit the `QUIZ` array
- **AI instructor persona** — edit the system prompt in `sendAsk()`

## Notes

- The Anthropic API key never touches the browser — all calls go through `/api/claude`
- No database needed; progress state is in-memory per session
- To add persistence across sessions, connect a database (Supabase, PlanetScale, etc.) and store progress by user ID
