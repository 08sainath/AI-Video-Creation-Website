const state = {
  step: 1,
  idea: '',
  format: 'Short video',
  language: 'English',
  tone: 'Energetic',
  duration: '60 sec',
  script: null,
  rendering: false,
  renderProgress: 0
};

const formats = ['Short video', 'YouTube video', 'Explainer', 'Social ad'];
const languages = ['English', 'Telugu', 'Hindi', 'Tamil', 'Kannada'];
const tones = ['Energetic', 'Professional', 'Cinematic', 'Friendly'];
const durations = ['30 sec', '60 sec', '90 sec', '3 min'];

function esc(value) {
  return String(value).replace(/[&<>\"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[ch]));
}

function selectOptions(items, selected) {
  return items.map(item => `<option ${item === selected ? 'selected' : ''}>${item}</option>`).join('');
}

function render() {
  document.querySelector('#app').innerHTML = `
    <div class="shell">
      <header class="topbar">
        <div class="brand"><div class="brand-mark">✦</div><div><div class="brand-name">VEOCRAFT</div><div class="brand-sub">AI VIDEO STUDIO</div></div></div>
        <nav><a class="active">Create</a><a>Projects</a><a>Templates</a></nav>
        <div class="top-actions"><button class="ghost">⌘ K</button><button class="avatar">S</button></div>
      </header>

      <main>
        <section class="hero">
          <div class="eyebrow">IDEA → SCRIPT → VIDEO</div>
          <h1>From one idea<br><span>to a finished video.</span></h1>
          <p>Describe what you want to say. VEOCRAFT writes the story, finds the visuals, voices it, captions it, and edits the whole thing.</p>
        </section>

        <section class="workflow">
          <div class="step ${state.step >= 1 ? 'done' : ''}"><span>01</span><div><b>Idea</b><small>Tell us what to make</small></div></div>
          <div class="connector ${state.step >= 2 ? 'filled' : ''}"></div>
          <div class="step ${state.step >= 2 ? 'done' : ''}"><span>02</span><div><b>Script</b><small>AI builds the story</small></div></div>
          <div class="connector ${state.step >= 3 ? 'filled' : ''}"></div>
          <div class="step ${state.step >= 3 ? 'done' : ''}"><span>03</span><div><b>Video</b><small>Assets, voice & edit</small></div></div>
        </section>

        ${state.step === 1 ? ideaView() : state.step === 2 ? scriptView() : videoView()}
      </main>

      <footer><span>VEOCRAFT • AI-powered video creation</span><span>All processing can be connected to your preferred AI providers</span></footer>
    </div>`;
  bind();
}

function ideaView() {
  return `<section class="composer card">
    <div class="card-head"><div><div class="label">YOUR IDEA</div><h2>What should the video be about?</h2><p>Keep it simple. One sentence is enough.</p></div><div class="sparkle">✦</div></div>
    <textarea id="idea" placeholder="e.g. Best features in ChatGPT that most people don't know about...">${esc(state.idea)}</textarea>
    <div class="quick-row"><button class="chip" data-idea="Best features in ChatGPT">Best features in ChatGPT</button><button class="chip" data-idea="5 habits for a productive morning">5 habits for a productive morning</button><button class="chip" data-idea="How AI is changing education">How AI is changing education</button></div>
    <div class="controls"><label>Format<select id="format">${selectOptions(formats,state.format)}</select></label><label>Language<select id="language">${selectOptions(languages,state.language)}</select></label><label>Tone<select id="tone">${selectOptions(tones,state.tone)}</select></label><label>Length<select id="duration">${selectOptions(durations,state.duration)}</select></label></div>
    <button class="primary wide" id="makeScript"><span>✦</span> Create my script <kbd>Enter ↵</kbd></button>
    <div class="trust">✦ AI plans every scene around your topic • No editing skills needed</div>
  </section>`;
}

function scriptView() {
  const s = state.script;
  return `<section class="split">
    <div class="card script-card"><div class="label">AI SCRIPT</div><div class="script-meta"><h2>${esc(s.title)}</h2><span>${esc(state.duration)} • ${esc(state.language)}</span></div><div class="hook">${esc(s.hook)}</div>${s.scenes.map((x,i)=>`<article class="scene"><div class="scene-num">0${i+1}</div><div><h3>${esc(x.heading)}</h3><p>${esc(x.text)}</p><div class="visual">Visual: ${esc(x.visual)}</div></div></article>`).join('')}</div>
    <aside class="card settings-card"><div class="label">VIDEO PLAN</div><h3>Everything is ready</h3><div class="plan-item"><span>◉</span><div><b>Voice-over</b><small>${esc(state.tone)} • Natural AI voice</small></div></div><div class="plan-item"><span>▣</span><div><b>Visuals</b><small>Stock + generated references</small></div></div><div class="plan-item"><span>CC</span><div><b>Captions</b><small>Auto-synced to speech</small></div></div><div class="plan-item"><span>♪</span><div><b>Music</b><small>Adaptive background score</small></div></div><div class="plan-item"><span>↗</span><div><b>Editing</b><small>Transitions + timing + motion</small></div></div><button class="secondary wide" id="backIdea">← Edit idea</button><button class="primary wide" id="renderVideo">Generate video <span>→</span></button></aside>
  </section>`;
}

function videoView() {
  return `<section class="video-result">
    <div class="card video-card"><div class="video-preview"><div class="preview-grid"></div><div class="play">${state.rendering ? '◌' : '▶'}</div><div class="preview-copy"><div class="label">PREVIEW</div><h2>${state.script ? esc(state.script.title) : 'Your video'}</h2><p>${state.rendering ? 'Rendering scenes, voice, captions and motion…' : 'Your video is ready to watch.'}</p></div><div class="progress"><span style="width:${state.renderProgress}%"></span></div></div><div class="video-bottom"><button class="secondary" id="newVideo">＋ New video</button><button class="primary" id="download" ${state.rendering ? 'disabled' : ''}>↓ Export MP4</button></div></div>
    <div class="card checklist"><div class="label">AUTOMATION CHECKLIST</div>${['Script locked','Visuals selected','AI voice generated','Captions synchronized','Music mixed','Final edit rendered'].map((x,i)=>`<div class="check ${state.renderProgress > i*16 ? 'on' : ''}"><span>✓</span>${x}<small>${state.renderProgress > i*16 ? 'Ready' : 'Queued'}</small></div>`).join('')}</div>
  </section>`;
}

function bind() {
  const ideaEl = document.querySelector('#idea');
  ideaEl?.addEventListener('input', e => state.idea = e.target.value);
  document.querySelectorAll('.chip').forEach(btn => btn.addEventListener('click', () => { state.idea = btn.dataset.idea; render(); document.querySelector('#idea')?.focus(); }));
  ['format','language','tone','duration'].forEach(id => document.querySelector('#'+id)?.addEventListener('change', e => state[id] = e.target.value));
  document.querySelector('#makeScript')?.addEventListener('click', makeScript);
  ideaEl?.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') makeScript(); });
  document.querySelector('#backIdea')?.addEventListener('click', () => { state.step = 1; render(); });
  document.querySelector('#renderVideo')?.addEventListener('click', renderVideo);
  document.querySelector('#newVideo')?.addEventListener('click', () => { state.step=1; state.idea=''; state.script=null; state.renderProgress=0; render(); });
  document.querySelector('#download')?.addEventListener('click', () => alert('Export is wired as a provider integration point. Connect your video renderer to generate the MP4.'));
}

function makeScript() {
  const idea = state.idea.trim() || 'Best features in ChatGPT';
  const title = idea.length > 45 ? idea.slice(0,45)+'…' : idea;
  state.script = {
    title,
    hook: `What if you could get more from ${idea.replace(/[.!?]$/,'')} without spending hours learning complicated tools? In this video, we’ll break it down into a few practical takeaways you can use today.`,
    scenes: [
      {heading:'Hook', text:`Start with a fast, curiosity-driven opening around “${idea}”.`, visual:'Kinetic title + fast establishing montage'},
      {heading:'The key idea', text:`Explain the core concept in plain language, then show why it matters to the viewer.`, visual:'Context cards + illustrative b-roll'},
      {heading:'What to try', text:`Give three memorable actions, examples, or features that make the topic useful immediately.`, visual:'Product-style UI shots + highlighted callouts'},
      {heading:'Wrap up', text:`Recap the biggest takeaway and close with a simple invitation to try it for themselves.`, visual:'Summary cards + clean CTA animation'}
    ]
  };
  state.step = 2;
  render();
}

function renderVideo() {
  state.step = 3;
  state.rendering = true;
  state.renderProgress = 6;
  render();
  const timer = setInterval(() => {
    state.renderProgress += Math.round(Math.random()*17)+7;
    if (state.renderProgress >= 100) {
      state.renderProgress = 100;
      state.rendering = false;
      clearInterval(timer);
    }
    render();
  }, 650);
}

render();
