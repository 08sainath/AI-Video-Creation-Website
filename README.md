# VEOCRAFT — AI Video Creation Website

An AI-first web experience for turning a simple idea into a complete video:

**Idea → Script → Video**

## Included in this starter

- Polished responsive studio UI
- Idea composer with format, language, tone, and duration controls
- AI-style script planning flow with hooks, scenes, visuals, and CTA structure
- Automated production checklist for voice, visuals, captions, music, and editing
- Rendering/progress experience
- Clean provider-agnostic architecture for connecting real AI APIs

## Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL.

## Connect real AI providers

The UI is intentionally provider-agnostic. A production backend should expose endpoints similar to:

- `POST /api/script` — idea → structured script and scene plan
- `POST /api/assets` — scene → stock/search/generated image or video assets
- `POST /api/voice` — script → speech audio + timestamps
- `POST /api/captions` — transcript/audio → synchronized captions
- `POST /api/render` — scenes + audio + captions + music → final MP4
- `GET /api/render/:id` — rendering progress/status

Recommended production pieces include an LLM for script planning, a web/stock media provider, an image/video generation provider, a TTS provider, and a render worker using FFmpeg or a hosted rendering API.

## Security

Keep all provider API keys server-side. Never place secret keys in `src/` or browser JavaScript. Add `.env` to `.gitignore` before connecting production services.
