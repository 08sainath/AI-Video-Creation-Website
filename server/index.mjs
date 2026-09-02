import 'dotenv/config';
import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import OpenAI from 'openai';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const app = express();
app.use(express.json({ limit: '2mb' }));
app.use('/generated', express.static(path.join(publicDir, 'generated')));

function client() {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is missing. Add it to .env.');
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function parseJson(text) {
  const clean = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  return JSON.parse(clean);
}

app.get('/api/health', (_req, res) => res.json({ ok: true, openaiConfigured: Boolean(process.env.OPENAI_API_KEY) }));

app.post('/api/generate-script', async (req, res) => {
  try {
    const { idea, format = 'Short video', language = 'English', tone = 'Energetic', duration = '60 sec' } = req.body;
    if (!idea?.trim()) return res.status(400).json({ error: 'Enter an idea first.' });
    const prompt = `Create a production-ready video plan. Return ONLY valid JSON with keys title, hook, scenes. scenes must be an array of 4-8 objects with heading, narration, visualPrompt, onScreenText. Topic: ${idea}. Format: ${format}. Language: ${language}. Tone: ${tone}. Duration: ${duration}. Make narration natural and concise enough for the requested duration. Visual prompts should describe cinematic, copyright-safe visuals.`;
    const response = await client().responses.create({ model: process.env.OPENAI_TEXT_MODEL || 'gpt-5.6-luna', input: prompt });
    const script = parseJson(response.output_text);
    res.json(script);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Script generation failed.' });
  }
});

async function generateSpeech(text, outFile) {
  const speech = await client().audio.speech.create({
    model: process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts',
    voice: process.env.OPENAI_TTS_VOICE || 'alloy',
    input: text,
    response_format: 'mp3'
  });
  await fs.writeFile(outFile, Buffer.from(await speech.arrayBuffer()));
}

async function generateImage(prompt, outFile) {
  const result = await client().images.generate({
    model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2',
    prompt,
    size: '1536x1024',
    quality: 'medium'
  });
  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error('Image generation did not return an image.');
  await fs.writeFile(outFile, Buffer.from(b64, 'base64'));
}

function srtTime(seconds) {
  const ms = Math.floor((seconds % 1) * 1000);
  const total = Math.floor(seconds);
  const s = total % 60;
  const m = Math.floor(total / 60) % 60;
  const h = Math.floor(total / 3600);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(ms).padStart(3,'0')}`;
}

app.post('/api/render', async (req, res) => {
  const job = await fs.mkdtemp(path.join(os.tmpdir(), 'veocraft-'));
  try {
    const { script } = req.body;
    if (!script?.scenes?.length) return res.status(400).json({ error: 'A generated script is required.' });
    const outDir = path.join(publicDir, 'generated');
    await fs.mkdir(outDir, { recursive: true });
    const narration = script.scenes.map(s => s.narration).join(' ');
    const audio = path.join(job, 'voice.mp3');
    await generateSpeech(narration, audio);

    const images = [];
    for (let i = 0; i < script.scenes.length; i++) {
      const file = path.join(job, `scene-${i}.png`);
      await generateImage(script.scenes[i].visualPrompt, file);
      images.push(file);
    }

    const audioProbe = await execFileAsync(ffmpegPath.path, ['-i', audio, '-f', 'null', '-'], { maxBuffer: 1024 * 1024 });
    const durationMatch = `${audioProbe.stderr || ''}`.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
    const totalDuration = durationMatch ? Number(durationMatch[1]) * 3600 + Number(durationMatch[2]) * 60 + Number(durationMatch[3]) : script.scenes.length * 5;
    const sceneDuration = Math.max(2.5, totalDuration / images.length);

    const concatFile = path.join(job, 'images.txt');
    const lines = images.flatMap(image => [`file '${image.replaceAll("'", "'\\''")}'`, `duration ${sceneDuration}`]);
    lines.push(`file '${images.at(-1).replaceAll("'", "'\\''")}'`);
    await fs.writeFile(concatFile, lines.join('\n'));

    const srt = script.scenes.map((scene, i) => {
      const start = i * sceneDuration;
      const end = Math.min(totalDuration, (i + 1) * sceneDuration);
      return `${i + 1}\n${srtTime(start)} --> ${srtTime(end)}\n${scene.narration}\n`;
    }).join('\n');
    const srtFile = path.join(job, 'captions.srt');
    await fs.writeFile(srtFile, srt);

    const safeId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const output = path.join(outDir, `${safeId}.mp4`);
    const vf = `scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,format=yuv420p`;
    await execFileAsync(ffmpegPath.path, ['-y','-f','concat','-safe','0','-i',concatFile,'-i',audio,'-vf',vf,'-r','30','-c:v','libx264','-preset','veryfast','-c:a','aac','-shortest',output], { maxBuffer: 10 * 1024 * 1024 });

    res.json({ videoUrl: `/generated/${safeId}.mp4`, captions: srt, duration: totalDuration });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Video rendering failed.' });
  } finally {
    await fs.rm(job, { recursive: true, force: true }).catch(() => {});
  }
});

app.listen(process.env.PORT || 8787, () => console.log(`VEOCRAFT API running on http://localhost:${process.env.PORT || 8787}`));
