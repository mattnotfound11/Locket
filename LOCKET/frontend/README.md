# LOCKET — Frontend

Client application for LOCKET.

## Getting started

```bash
npm install
npm run dev
```

## Structure

```
frontend/
├── src/          # application source
├── public/       # static assets
└── README.md
```

## Environment

Copy `.env.example` to `.env.local` and fill in the values. Never commit real
secrets — `.env*` files are ignored by git.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm test` | Run tests |
