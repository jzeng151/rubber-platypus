# Rubber Platypus

A virtual rubber duck debugger, but a platypus. Pet it, bonk it, squish it, toss it. Ask it Socratic questions or just get quacked at.

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and add your LLM API key:

```bash
cp .env.example .env
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

Deploy to Vercel. Set `LLM_API_KEY` and `LLM_PROVIDER` (optional, defaults to `openai`) as environment variables.

## Tech Stack

- Vite + React + TypeScript
- React Three Fiber + Rapier Physics
- Zustand for state
- Howler.js for audio
- Vercel serverless API for LLM proxy
