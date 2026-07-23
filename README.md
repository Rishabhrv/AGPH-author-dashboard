# Intelly Dashboard

A Next.js 14 (App Router) + TypeScript + Tailwind CSS recreation of the Intelly
patient-billing and clinical dashboard designs.

## Pages

- `/` — Dashboard: greeting header, patients/visits/condition/sessions widgets,
  patient list with visit detail panel, and a calendar with today's timeline.
- `/billing` — Billing & invoices: payments donut summary, waiting-for-bills
  and latest-transaction cards, stat cards, and a filterable transactions table.

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

> The first build/dev run fetches "Plus Jakarta Sans" from Google Fonts via
> `next/font/google`, so an internet connection is required at build time.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (custom color tokens in `tailwind.config.ts` matching the
  design's cream/pink/yellow/blue/sage palette)
- Recharts for the bar/line/pie/donut charts
- lucide-react for icons

## Structure

```
app/
  layout.tsx          Shared frame + font
  page.tsx             Dashboard page
  billing/page.tsx      Billing page
components/
  layout/               Sidebar, TopBar, AppShell
  dashboard/             Dashboard-only widgets
  billing/                Billing-only widgets
lib/
  data.ts                 Mock data used across both pages
```

All data is mocked in `lib/data.ts` — swap it for real API calls when wiring
up a backend.
