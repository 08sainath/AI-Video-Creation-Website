# VEOCRAFT — AI Video Creation Studio

Turn one idea into a finished MP4: **Idea → Script → AI visuals → AI voice → captions → render**.

## Run locally

1. Install Node.js 18+.
2. Copy `.env.example` to `.env`.
3. Put your OpenAI API key in `.env`.
4. Install dependencies:

```bash
npm install
```

5. Start the full app:

```bash
npm run dev:full
```

6. Open `http://localhost:5173`.

Vite serves the browser app on port 5173. Express runs the AI/video backend on port 8787 and Vite proxies `/api` and `/generated` automatically.

## Real generation pipeline

- **Script:** OpenAI Responses API
- **Visuals:** OpenAI image generation, one scene image per scene
- **Voice:** OpenAI text-to-speech
- **Captions:** generated SRT based on scene timing
- **Video:** FFmpeg creates a 1280×720 MP4 from the generated scenes and voice track

API endpoints:

- `GET /api/health`
- `POST /api/generate-script`
- `POST /api/render`

## Security

Never put an OpenAI API key in frontend JavaScript or commit `.env`. The key belongs only on the server.

The current renderer is a real image-based video MVP. A production tier can add licensed stock footage, generated video clips, music libraries, scene-level animation, persistent jobs, authentication, storage, and cloud rendering.
