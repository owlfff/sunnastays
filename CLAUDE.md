# SunnaStays — Claude Code Instructions

## What this project is
A halal-certified short-stay marketplace (think Airbnb for Muslim travellers). Guests book properties; hosts list and manage them. All properties are manually reviewed by an admin before going live.

## Tech stack
- **Frontend**: Create React App (`react-scripts`), CSS modules per component (no Tailwind)
- **Backend**: Vercel serverless functions in `api/` (Node.js, CommonJS `require` or ES module `export default`)
- **Database + Auth**: Supabase (Postgres). Auth is Supabase Auth. Row Level Security (RLS) is the primary data protection layer.
- **Payments**: Stripe — Checkout Sessions for guest payments, Connect for host payouts
- **Email**: Resend API, called from serverless functions only (never from the frontend)
- **Phone verification**: Twilio Verify
- **Maps**: Google Maps JavaScript API (Places + Marker libraries)
- **E2E tests**: Playwright, running against `https://www.sunnastays.com`
- **Deployment**: Vercel (Hobby plan)

## Critical constraints
- **Vercel Hobby plan: max 12 serverless functions.** Currently at 11. Do not add new files to `api/` without removing or merging an existing one.
- **`REACT_APP_` env var prefix** exposes a variable to the browser bundle (CRA behaviour). Never use this prefix for secrets. Only `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`, and `REACT_APP_GOOGLE_MAPS_KEY` should have this prefix.
- **`.env.local` is gitignored and must never be committed.**

## Environment variables
| Variable | Where used | Notes |
|---|---|---|
| `REACT_APP_SUPABASE_URL` | Frontend + api/ | Public, fine to expose |
| `REACT_APP_SUPABASE_ANON_KEY` | Frontend + api/ | Public by design |
| `SUPABASE_SERVICE_KEY` | api/ only | Full DB access — never in src/ |
| `REACT_APP_GOOGLE_MAPS_KEY` | Frontend only | Restricted to *.sunnastays.com in Google Cloud Console |
| `STRIPE_SECRET_KEY` | api/ only | Secret |
| `RESEND_KEY` | api/ only | Secret — no REACT_APP_ prefix |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_VERIFY_SID` | api/ only | Secret |
| `CRON_SECRET` | api/ only | Protects cron endpoints |

## Key file locations
- `src/supabase.js` — Supabase client (anon key, for frontend use)
- `src/api/index.js` — all frontend→Supabase/API calls in one place
- `src/pages/` — full page components
- `src/components/` — reusable components
- `api/send-booking-email.js` — handles three email types via a `type` field (`booking-new`, `booking-status`, `listing-status`)
- `api/stripe-webhook.js` — Stripe webhook handler (payment capture, payout scheduling)
- `e2e/` — Playwright tests
- `playwright.config.js` — uses dotenv to load `.env.local`

## API authorization pattern
Serverless functions that act on behalf of a user must **never trust a `userId` from `req.body`**. Always extract the authenticated user from the JWT:
```js
const { data: { user }, error } = await supabaseAuth.auth.getUser(
  req.headers.authorization?.replace('Bearer ', '')
);
if (error || !user) return res.status(401).json({ error: 'Unauthorised' });
```
The frontend sends the token via:
```js
const { data: { session } } = await supabase.auth.getSession();
headers: { 'Authorization': `Bearer ${session?.access_token}` }
```

## Database notes
- `properties.id` is `bigint` (bigserial), not UUID — foreign keys referencing it must be `bigint`
- `bookings.guest_id` is a UUID (Supabase auth user ID)
- Blocked dates are stored in `blocked_dates` table with `property_id` (bigint), `start_date`, `end_date` (both inclusive). When mapping to the guest booking calendar, add 1 day to `end_date` to convert to exclusive-end convention.
- `profiles` table holds `role` (guest/host/admin), `stripe_account_id`, `stripe_account_status`, `phone`, `phone_verified`

## Coding conventions
- CSS is co-located with each component (e.g. `BookingModal.jsx` + `BookingModal.css`)
- CSS variables: `--ink`, `--ink-soft`, `--ink-mid`, `--cream`, `--sand`, `--sand-dark`, `--sand-deep`, `--terra`, `--terra-muted`, `--success`, `--white`
- Font families: `'Fraunces', serif` for headings, `'DM Sans', sans-serif` for body
- No TypeScript — plain JS throughout
- No Tailwind — plain CSS only
- Emoji are used sparingly in UI but not in code comments

## Deployment
- Production URL: `https://www.sunnastays.com` (canonical — `sunnastays.com` redirects to `www`)
- Deploys automatically on push to `main`
- Vercel environment variables must be kept in sync with `.env.local` when new vars are added
