const state = {
  step: 1,
  idea: '',
  format: 'Short video',
  language: 'English',
  tone: 'Energetic',
  duration: '60 sec',
  script: null,
  rendering: false,
  renderProgress: 0,
  videoUrl: null,
  error: ''
};

const formats = ['Short video', 'YouTube video', 'Explainer', 'Social ad'];
const languages = ['English', 'Telugu', 'Hindi', 'Tamil', 'Kannada'];
const tones = ['Energetic', 'Professional', 'Cinematic', 'Friendly'];
const durations = ['30 sec', '60 sec', '90 sec', '3 min'];

function esc(value) {
  return String(value ?? '').replace(/[&<>\"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[ch]));
}
function selectOptions(items, selected) { return items.map(item => `<option ${item === selected ? 'selected' : ''}>${item}</option>`).join(''); }

function render() {
  document.querySelector('#app').innerHTML = `
    <div class="shell">
      <header class="topbar"><div class="brand"><div class="brand-mark">✦</div><div><div class="brand-name">VEOCRAFT</div><div class="brand-sub">AI VIDEO STUDIO</div></div></div><nav><a class="active">Create</a><a>Projects</a><a>Templates</a></nav><div class="top-actions"><button class="ghost">AI</button><button class="avatar">S</button></div></header>
      <main>
        <section class="hero"><div class="eyebrow">IDEA → SCRIPT → VIDEO</div><h1>From one idea<br><span>to a finished video.</span></h1><p>Describe what you want to say. AI writes the story, generates visuals and voice, creates captions, and renders the MP4 automatically.</p></section>
        <section class="workflow"><div class="step ${state.step >= 1 ? 'done' : ''}"><span>01</span><div><b>Idea</b><small>Tell us what to make</small></div></div><div class="connector ${state.step >= 2 ? 'filled' : ''}"></div><div class="step ${state.step >= 2 ? 'done' : ''}"><span>02</span><div><b>Script</b><small>AI builds the story</small></div></div><div class="connector ${state.step >= 3 ? 'filled' : ''}"></div><div class="step ${state.step >= 3 ? 'done' : ''}"><span>03</span><div><b>Video</b><small>Assets, voice & edit</small></div></div></section>
        ${state.error ? `<div class="card" style="margin-bottom:18px;padding:14px;color:#ffb4b4">${esc(state.error)}</div>` : ''}
        ${state.step === 1 ? ideaView() : state.step === 2 ? scriptView() : videoView()}
      </main>
      <footer><span>VEOCRAFT • Real AI generation pipeline</span><span>Script + images + voice + captions + MP4</span></footer>
    </div>`;
  bind();
}

function ideaView() {
  return `<section class="composer card"><div class="card-head"><div><div class="label">YOUR IDEA</div><h2>What should the video be about?</h2><p>One sentence is enough.</p></div><div class="sparkle">✦</div></div><textarea id="idea" placeholder="e.g. Best features in ChatGPT that most people don't know about...">${esc(state.idea)}</textarea><div class="quick-row"><button class="chip" data-idea="Best features in ChatGPT">Best features in ChatGPT</button><button class="chip" data-idea="5 habits for a productive morning">5 habits for a productive morning</button><button class="chip" data-idea="How AI is changing education">How AI is changing education</button></div><div class="controls"><label>Format<select id="format">${selectOptions(formats,state.format)}</select></label><label>Language<select id="language">${selectOptions(languages,state.language)}</select></label><label>Tone<select id="tone">${selectOptions(tones,state.tone)}</select></label><label>Length<select id="duration">${selectOptions(durations,state.duration)}</select></label></div><button class="primary wide" id="makeScript"><span>✦</span> Generate real AI script <kbd>Ctrl ↵</kbd></button><div class="trust">✦ Uses your configured AI provider • No hard-coded demo script</div></section>`;
}

function scriptView() {
  const s = state.script;
  return `<section class="split"><div class="card script-card"><div class="label">AI SCRIPT</div><div class="script-meta"><h2>${esc(s.title)}</h2><span>${esc(state.duration)} • ${esc(state.language)}</span></div><div class="hook">${esc(s.hook)}</div>${s.scenes.map((x,i)=>`<article class="scene"><div class="scene-num">${String(i+1).padStart(2,'0')}</div><div><h3>${esc(x.heading)}</h3><p>${esc(x.narration)}</p><div class="visual">Visual: ${esc(x.visualPrompt)}</div><div class="visual">On-screen: ${esc(x.onScreenText)}</div></div></article>`).join('')}</div><aside class="card settings-card"><div class="label">VIDEO PLAN</div><h3>AI production pipeline</h3><div class="plan-item"><span>◉</span><div><b>Voice-over</b><small>Natural AI speech</small></div></div><div class="plan-item"><span>▣</span><div><b>AI visuals</b><small>One generated visual per scene</small></div></div><div class="plan-item"><span>CC</span><div><b>Captions</b><small>Generated SRT timing</small></div></div><div class="plan-item"><span>♪</span><div><b>Audio mix</b><small>Voice track ready for render</small></div></div><div class="plan-item"><span>↗</span><div><b>MP4 render</b><small>FFmpeg 1280×720 output</small></div></div><button class="secondary wide" id="backIdea">← Edit idea</button><button class="primary wide" id="renderVideo">Generate real video <span>→</span></button></aside></section>`;
}

function videoView() {
  const ready = state.renderProgress >= 100 && state.videoUrl;
  return `<section class="video-result"><div class="card video-card">${ready ? `<video class="real-video" controls src="${state.videoUrl}"></video>` : `<div class="video-preview"><div class="preview-grid"></div><div class="play">${state.rendering ? '◌' : '▶'}</div><div class="preview-copy"><div class="label">RENDERING</div><h2>${esc(state.script?.title || 'Your video')}</h2><p>${state.rendering ? 'Generating visuals, voice, captions and MP4…' : 'Preparing the video…'}</p></div><div class="progress"><span style="width:${state.renderProgress}%"></span></div></div>`}<div class="video-bottom"><button class="secondary" id="newVideo">＋ New video</button>${ready ? `<a class="primary" href="${state.videoUrl}" download>↓ Export MP4</a>` : `<button class="primary" disabled>${state.renderProgress}%</button>`}</div></div><div class="card checklist"><div class="label">AUTOMATION CHECKLIST</div>${['Script locked','AI visuals generated','AI voice generated','Captions synchronized','Audio mixed','Final MP4 rendered'].map((x,i)=>`<div class="check ${state.renderProgress >= [10,30,50,65,80,100][i] ? 'on' : ''}"><span>✓</span>${x}<small>${state.renderProgress >= [10,30,50,65,80,100][i] ? 'Ready' : 'Queued'}</small></div>`).join('')}</div></section>`;
}

function bind() {
  const ideaEl = document.querySelector('#idea');
  ideaEl?.addEventListener('input', e => state.idea = e.target.value);
  document.querySelectorAll('.chip').forEach(btn => btn.addEventListener('click', () => { state.idea = btn.dataset.idea; render(); document.querySelector('#idea')?.focus(); }));
  ['format','language','tone','duration'].forEach(id => document.querySelector('#'+id)?.addEventListener('change', e => state[id] = e.target.value));
  document.querySelector('#makeScript')?.addEventListener('click', makeScript);
  ideaEl?.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') makeScript(); });
  document.querySelector('#backIdea')?.addEventListener('click', () => { state.step=1; state.error=''; render(); });
  document.querySelector('#renderVideo')?.addEventListener('click', renderVideo);
  document.querySelector('#newVideo')?.addEventListener('click', () => { Object.assign(state,{step:1,idea:'',script:null,renderProgress:0,rendering:false,videoUrl:null,error:''}); render(); });
}

async function makeScript() {
  state.error=''; state.step=2; state.script={title:'Writing your script…',hook:'AI is researching the best structure for your idea.',scenes:[]}; render();
  try {
    const r = await fetch('/api/generate-script',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idea:state.idea,format:state.format,language:state.language,tone:state.tone,duration:state.duration})});
    const data=await r.json(); if(!r.ok) throw new Error(data.error||'Script generation failed'); state.script=data;
  } catch(e) { state.error=e.message; state.step=1; }
  render();
}

async function renderVideo() {
  state.error=''; state.step=3; state.rendering=true; state.renderProgress=8; state.videoUrl=null; render();
  const progress=[18,34,50,66,82,94];
  let i=0; const timer=setInterval(()=>{ if(i<progress.length){state.renderProgress=progress[i++];render();}else clearInterval(timer); },1800);
  try {
    const r=await fetch('/api/render',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({script:state.script})});
    const data=await r.json(); if(!r.ok) throw new Error(data.error||'Video render failed');
    clearInterval(timer); state.renderProgress=100; state.rendering=false; state.videoUrl=data.videoUrl;
  } catch(e){ clearInterval(timer); state.rendering=false; state.error=e.message; }
  render();
}

render();
