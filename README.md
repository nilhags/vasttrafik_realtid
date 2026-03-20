# Jobbkompassen

Privat jobbsökarapp för svenska jobbannonser. Frontend är byggd för Cloudflare Pages, autentisering och databas körs via Supabase.

## Varför den här stacken

- `Cloudflare Pages` för gratis publik hosting av frontend
- `Supabase Auth` för e-post + lösenord
- `Supabase Postgres` för jobb, favoriter och sparade sökningar
- `robots.txt` + `X-Robots-Tag` + skyddade routes för att undvika indexering

## Lokalt

1. Installera beroenden med `npm install`
2. Kopiera `.env.example` till `.env`
3. Lägg in `VITE_SUPABASE_URL` och `VITE_SUPABASE_ANON_KEY`
4. Kör `npm run dev`

För server-side ingest behövs också:

- `SUPABASE_SERVICE_ROLE_KEY`

## Cloudflare Pages

Bygginställningar:

- Build command: `npm run build`
- Build output directory: `dist`
- Environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## Online-hämtning av jobb

Jobbhämtning är förberedd att köras online via
[.github/workflows/fetch-jobs.yml](/Users/nils.hagstrom/Kodning/vasttrafik_realtid/.github/workflows/fetch-jobs.yml).

GitHub-secrets som behövs:

- `VITE_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Schemat kör import tre gånger per dag. Arbetsförmedlingen hämtas med Karlskoga som utgångspunkt och `100 km` radie.

## Supabase

1. Skapa ett projekt i Supabase
2. Aktivera `Email` under Auth Providers
3. Kör SQL:en i [supabase/schema.sql](/Users/nils.hagstrom/Kodning/vasttrafik_realtid/supabase/schema.sql)
4. Skapa första användaren via Auth i Supabase-dashboarden

## Inte publikt sökbar

Appen är förberedd för att inte indexeras:

- [public/robots.txt](/Users/nils.hagstrom/Kodning/vasttrafik_realtid/public/robots.txt)
- [public/_headers](/Users/nils.hagstrom/Kodning/vasttrafik_realtid/public/_headers)
- inloggningskrav i [src/ui/AuthGate.tsx](/Users/nils.hagstrom/Kodning/vasttrafik_realtid/src/ui/AuthGate.tsx)

För extra skydd kan ni senare lägga Cloudflare Access framför hela siten, men det behövs inte för MVP.
