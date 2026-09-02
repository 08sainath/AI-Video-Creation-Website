# Production Architecture

The front-end flow is designed around a single project object passed through a job pipeline.

```text
Idea
  ↓
Script Planner
  ↓
Scene Planner
  ↓
Asset Resolver ──→ stock video / images / generated media
  ↓
Voice Service ──→ speech + word timestamps
  ↓
Caption Service ──→ SRT/WebVTT/word timings
  ↓
Timeline Composer ──→ transitions / overlays / music / mix
  ↓
Render Worker ──→ MP4
  ↓
Playback + Export
```

## Suggested API contract

`POST /api/projects`

```json
{
  "idea": "Best features in ChatGPT",
  "format": "Short video",
  "language": "English",
  "tone": "Energetic",
  "duration": "60 sec"
}
```

Returns a project ID and structured script. The server then queues downstream production jobs.

Each scene should store:

- narration text
- estimated duration
- visual query/prompt
- selected media URL
- on-screen text
- caption timing
- transition
- music cue

Use durable object storage for source assets, generated assets, audio, captions, and final exports. Use a queue for render jobs so large renders do not block web requests.
