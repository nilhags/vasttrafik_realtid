# Arbetsplan

## Fas 1: Stabil grund

- få `vite build` att gå igenom
- synka frontend, ingest och Supabase-schema
- säkerställa att jobbdata kan läsas konsekvent från `jobs`

## Fas 2: Online-ingest

- flytta hämtning av jobb till schemalagd körning online
- använda server-side credentials i stället för publik `anon`-nyckel
- köra Arbetsförmedlingen automatiskt från GitHub Actions

## Fas 3: Produktion

- deploya frontend till `Cloudflare Pages`
- koppla miljövariabler till Supabase
- verifiera att inloggning fungerar för befintlig användare
- säkerställa att appen inte indexeras publikt

## Fas 4: Fler källor

- lägga till `Greenhouse`
- lägga till `Lever`
- utvärdera och lägga till utvalda `Teamtailor`-källor
- därefter fler svenska offentliga och privata källor

## Fas 5: Filter och sortering

- behålla nuvarande filter: söktext, ort, distansläge, omfattning, erfarenhet
- behålla nuvarande sortering: nyast, närmast
- utöka i följande ordning:
  - publiceringsålder
  - arbetsgivare
  - kategori/bransch
  - språkkrav
  - lön finns
  - sista ansökningsdag

## Fas 6: Datakvalitet

- deduplicera jobb mellan källor
- behålla `source_name` och `original_url`
- förbättra normalisering av ort, avstånd och metadata
