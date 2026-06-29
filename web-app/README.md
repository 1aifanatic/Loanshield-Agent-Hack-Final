# LoanShield Web App

This folder contains the Next.js portal used for the hackathon demo.

## Main Responsibilities

- Create synthetic loan disputes.
- Store dispute state in Neon Postgres or local memory.
- Send secured webhook events to UiPath.
- Receive UiPath case callbacks at `/api/uipath/case-updates`.
- Serve UiPath case context at `/api/uipath/case-context`.
- Render dashboard, stage cards, evidence, timeline, and actor summaries.

## Local Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Useful Commands

```bash
npm run lint
npm run seed
npm run smoke
```

`seed` creates canned demo disputes. `smoke` checks health, login, scenario launch, callback intake, and case context.
