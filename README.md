# SunnaStays

Halal-certified short stays for the modern Muslim traveller.

## Stack

- **React 18** + React Router v6
- **Vercel** hosting (configured via `vercel.json`)
- **API layer** at `src/api/index.js` — mock data by default, ready to wire to a real backend

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server at http://localhost:3000
npm start
```

---

## Deploy to Vercel (first time)

1. Push this folder to a GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "Initial SunnaStays build"
   git remote add origin https://github.com/YOUR_USERNAME/sunnastays.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo

3. Vercel auto-detects Create React App. Hit **Deploy**.

4. In **Project Settings → Domains**, add `sunnastays.com` and follow the DNS instructions.

---

## Connect a Real Backend

All API calls live in `src/api/index.js`. To switch from mock data to a real API:

1. Create a `.env.local` file in the project root:
   ```
   REACT_APP_API_URL=https://api.sunnastays.com
   ```

2. In Vercel dashboard → **Settings → Environment Variables**, add the same key for Production.

3. Your backend needs these endpoints:
   | Method | Path | Description |
   |--------|------|-------------|
   | GET | `/stays` | Search stays (query: `destination`, `checkin`, `checkout`, `guests`) |
   | GET | `/stays/:slug` | Single stay detail |
   | POST | `/listings` | Submit new host listing |
   | GET | `/me` | Current authenticated user |

---

## Project Structure

```
src/
├── api/
│   └── index.js          # All API calls + mock data
├── components/
│   ├── Nav.jsx/.css
│   ├── SearchBar.jsx/.css
│   ├── StayCard.jsx/.css
│   └── Footer.jsx/.css
├── hooks/
│   ├── useSearch.js       # Search state + navigation
│   └── useOnboarding.js   # 5-step form state
├── pages/
│   ├── Home.jsx/.css
│   ├── SearchResults.jsx/.css
│   ├── Listing.jsx/.css
│   └── HostOnboarding.jsx/.css
├── styles/
│   └── global.css         # CSS variables + utilities
├── App.jsx                # Router
└── index.js               # Entry point
```

---

## Routes

| URL | Page |
|-----|------|
| `/` | Home with search |
| `/search?destination=Istanbul&guests=2` | Search results |
| `/stays/ottoman-terrace-suite` | Property listing |
| `/host` | Host onboarding (5 steps) |
