const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
let seconds = 0;
let onboardingStep = 1;
const activityData = [
  { time: '00:02:14', dept: 'Marketing', business: 'Northstar', status: '[AWAITING APPROVAL]', action: 'Customer-facing draft blocked until founder review.' },
  { time: '00:08:31', dept: 'Product', business: 'Northstar', status: '[RETRY 2/5]', action: 'Validating release-impacting task shell with named retry.' },
  { time: '00:19:03', dept: 'Finance', business: 'Signal Grove', status: '[WARN]', action: 'Metric score unavailable because formula is missing.' },
  { time: '00:24:11', dept: 'Strategy', business: 'Atlas Draft', status: '[QUEUED]', action: 'New business shell waiting for approved execution plan.' }
];
const seededLogs = [
  '> [SEEDED] Marketing Guru: Draft shell prepared for founder review — no customer send executed.',
  '> [SEEDED] Product Architect: Stage breadcrumb updated: checking source → validating placeholders → ready.',
  '> [SEEDED] Financial Genius: Score hidden; formula is [MISSING].',
  '> [SEEDED] Strategy Desk: Awaiting approved plan before execution starts.'
];

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="tag running">[OK]</span>${message}`;
  $('#toastRegion').appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function showScreen(name) {
  $$('.screen').forEach(screen => screen.classList.toggle('active', screen.id === `screen-${name}`));
  $$('.nav-item').forEach(btn => btn.classList.toggle('active', btn.dataset.screen === name));
  if (window.innerWidth < 720) $('#nav').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openDrawer(type) {
  const title = $('#drawerTitle');
  const body = $('#drawerBody');
  if (type === 'decision') {
    title.textContent = 'Pending Decision';
    body.innerHTML = `
      <p><span class="tag approval">[AWAITING APPROVAL]</span> Customer-facing action requires founder confirmation.</p>
      <div class="recommendation glass-card"><strong>Proposal</strong><p>Approve a draft outbound message shell. The actual message body is not invented in this prototype.</p></div>
      <div class="recommendation glass-card"><strong>Why approval is required</strong><p>Customer messaging is a high-risk action. The source pack requires approval-first behavior.</p></div>
      <div class="recommendation glass-card"><strong>What changes on approval</strong><p>A real implementation would quote the exact action and update the activity log. Reversibility window is [MISSING].</p></div>
      <button class="btn-primary" id="approveDecision">Approve</button>
      <button class="btn-ghost" id="redirectDecision">Redirect</button>
      <button class="btn-ghost" id="deferDecision">Defer</button>`;
    $('#approveDecision').onclick = () => openModal('Approve this customer-facing draft shell?', 'Reversibility window is [MISSING], so this prototype only demonstrates the confirmation pattern.', false, () => { closeDrawer(); appendLog('> [SEEDED] Founder approved demo decision pattern — no real external action executed.'); showToast('Approved demo decision pattern.'); });
    $('#redirectDecision').onclick = () => { closeDrawer(); openDrawer('chat'); showToast('Decision loaded into chat context.'); };
    $('#deferDecision').onclick = () => { closeDrawer(); showToast('Deferred. Resurface interval is [MISSING].'); };
  }
  if (type === 'artifact') {
    title.textContent = 'Artifact Viewer';
    body.innerHTML = `
      <p><span class="tag conceptual">[CONCEPTUAL]</span> Tangible outputs appear here when real artifacts exist.</p>
      <div class="recommendation glass-card"><strong>Artifact body</strong><p>Artifact not available yet — current stage: <code>&gt; drafting → awaiting approval</code>. No deliverable text is fabricated.</p></div>
      <div class="recommendation glass-card"><strong>Why this exists</strong><p>The product value depends on opening real work outputs, not dashboard decoration.</p></div>
      <button class="btn-primary" id="copyArtifact">Copy placeholder note</button>
      <button class="btn-ghost" id="commentArtifact">Comment</button>
      <button class="btn-ghost" data-screen="activity" id="jumpActivity">Open in Activity Log</button>`;
    $('#copyArtifact').onclick = () => showToast('Copied placeholder note.');
    $('#commentArtifact').onclick = () => { appendLog('> [SEEDED] Founder commented on conceptual artifact shell.'); showToast('Comment pattern recorded.'); };
    $('#jumpActivity').onclick = () => { closeDrawer(); showScreen('activity'); };
  }
  if (type === 'chat') {
    title.textContent = 'Talk to cofounder';
    body.innerHTML = `
      <p><span class="tag demo">[DEMO]</span> Global chat drawer carries current-screen context.</p>
      <div class="chat-thread" id="drawerChatThread"><div class="message system glass-card"><strong>Context</strong><p>Current screen loaded. Ask for explanation, redirect, or decision support.</p></div></div>
      <form class="composer" id="drawerChatForm"><input id="drawerChatInput" placeholder="Type instruction…" /><button class="btn-primary">Send</button></form>`;
    $('#drawerChatForm').onsubmit = e => { e.preventDefault(); const value = $('#drawerChatInput').value.trim(); if (!value) return; $('#drawerChatThread').insertAdjacentHTML('beforeend', `<div class="message glass-card"><strong>You</strong><p>${escapeHtml(value)}</p></div><div class="message system glass-card"><span class="tag demo">[DEMO]</span><strong>Cofounder</strong><p>Received prototype instruction. Real execution requires backend capability confirmation.</p></div>`); $('#drawerChatInput').value = ''; showToast('Demo message sent.'); };
  }
  $('#drawer').classList.add('open');
  $('#drawer').setAttribute('aria-hidden', 'false');
}
function closeDrawer() { $('#drawer').classList.remove('open'); $('#drawer').setAttribute('aria-hidden', 'true'); }

function openModal(title, text, typed, onConfirm) {
  $('#modalTitle').textContent = title;
  $('#modalText').textContent = text;
  $('#typedConfirm').classList.toggle('hidden', !typed);
  $('#typedConfirm').value = '';
  $('#modalBackdrop').classList.add('open');
  $('#modalBackdrop').setAttribute('aria-hidden', 'false');
  $('#confirmModal').onclick = () => {
    if (typed && $('#typedConfirm').value !== 'DELETE') { showToast('Type DELETE to confirm.'); return; }
    closeModal();
    onConfirm && onConfirm();
  };
}
function closeModal() { $('#modalBackdrop').classList.remove('open'); $('#modalBackdrop').setAttribute('aria-hidden', 'true'); }
function appendLog(text) {
  $('#engineEmpty').style.display = 'none';
  const line = document.createElement('div');
  line.className = 'log-line';
  line.innerHTML = `<span>${new Date().toLocaleTimeString([], {hour12:false})}</span><span class="tag demo">[SEEDED]</span><strong>${escapeHtml(text)}</strong><span>00m ${String(seconds % 60).padStart(2, '0')}s</span>`;
  $('#liveFeed').prepend(line);
}
function renderActivity() {
  const q = $('#activitySearch')?.value.toLowerCase() || '';
  const dept = $('#departmentFilter')?.value || 'all';
  const rows = activityData.filter(item => (dept === 'all' || item.dept === dept) && `${item.time} ${item.dept} ${item.business} ${item.status} ${item.action}`.toLowerCase().includes(q));
  $('#activityRows').innerHTML = rows.length ? rows.map(item => `<button class="activity-row" data-action="artifact"><span>${item.time}</span><strong>${item.business}</strong><span>${item.dept}</span><span>${escapeHtml(item.action)}</span><span class="tag">${item.status}</span></button>`).join('') : '<div class="empty-engine">No actions match these filters. Clear filters to recover.</div>';
  $$('[data-action="artifact"]', $('#activityRows')).forEach(btn => btn.onclick = () => openDrawer('artifact'));
}
function escapeHtml(str) { return str.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

setInterval(() => {
  seconds++;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  $('#tickerTimer').textContent = `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  $$('.timer').forEach((el, i) => el.textContent = `00h ${String(24 + Math.floor((seconds + i) / 60)).padStart(2, '0')}m ${String((11 + seconds + i) % 60).padStart(2, '0')}s`);
}, 1000);

$$('[data-screen]').forEach(btn => btn.addEventListener('click', () => showScreen(btn.dataset.screen)));
$('#mobileToggle').onclick = () => { $('#nav').classList.toggle('open'); $('#mobileToggle').setAttribute('aria-expanded', $('#nav').classList.contains('open')); };
$('#openChatTop').onclick = () => openDrawer('chat');
$('#floatingChat').onclick = () => openDrawer('chat');
$('#closeDrawer').onclick = closeDrawer;
$('#cancelModal').onclick = closeModal;
$$('[data-action="decision"]').forEach(btn => btn.onclick = () => openDrawer('decision'));
$$('[data-action="artifact"]').forEach(btn => btn.onclick = () => openDrawer('artifact'));
$('#appendDemoLog').onclick = () => appendLog(seededLogs[Math.floor(Math.random() * seededLogs.length)]);
$$('.tab').forEach(tab => tab.onclick = () => { $$('.tab').forEach(t => t.classList.remove('active')); $$('.tab-panel').forEach(p => p.classList.remove('active')); tab.classList.add('active'); $(`#tab-${tab.dataset.tab}`).classList.add('active'); });
$('#autonomy').oninput = e => { const labels = ['Low — approve most work', 'Medium — approvals required for risk', 'High — high-risk approval still required']; $('#autonomyLabel').textContent = labels[e.target.value - 1]; };
$('#pauseBusiness').onclick = () => openModal('Pause Northstar Labs?', 'Tasks will drain or stop according to confirmed rules. Exact pause behavior is [MISSING].', false, () => showToast('Business pause pattern applied.'));
$('#archiveBusiness').onclick = () => openModal('Archive Northstar Labs?', 'Archive behavior and data retention should be confirmed before production.', false, () => showToast('Business archive pattern applied.'));
$('#redirectFromRecommendation').onclick = () => openDrawer('chat');
$('#deferRecommendation').onclick = () => showToast('Recommendation deferred. Resurface interval is [MISSING].');

$$('.prompt-grid button').forEach(btn => btn.onclick = () => { $('#chatInput').value = btn.dataset.prompt; $('#chatInput').focus(); });
$('#chatForm').onsubmit = e => { e.preventDefault(); const value = $('#chatInput').value.trim(); if (!value) return; $('#chatThread').insertAdjacentHTML('beforeend', `<div class="message glass-card"><strong>You</strong><p>${escapeHtml(value)}</p></div><div class="message system glass-card"><span class="tag demo">[DEMO]</span><strong>Cofounder</strong><p>Prototype response only. Real command execution depends on confirmed backend actions and approval rules.</p></div>`); $('#chatInput').value = ''; showToast('Demo chat message sent.'); };
$('#activitySearch').oninput = renderActivity;
$('#departmentFilter').onchange = renderActivity;
$('#clearFilters').onclick = () => { $('#activitySearch').value = ''; $('#departmentFilter').value = 'all'; renderActivity(); };
$('#exportCsv').onclick = () => openModal('Export CSV?', 'This demonstrates the export confirmation flow. Real records are required for production export.', false, () => showToast('CSV export pattern confirmed.'));
$('#settingsExport').onclick = () => openModal('Export account data?', 'Export scope and records must be backed by real data.', false, () => showToast('Data export pattern confirmed.'));
$$('.settings-tab').forEach(tab => tab.onclick = () => { $$('.settings-tab').forEach(t => t.classList.remove('active')); $$('.settings-content').forEach(c => c.classList.remove('active')); tab.classList.add('active'); $(`#settings-${tab.dataset.settings}`).classList.add('active'); });
$('#deleteAccount').onclick = () => openModal('Delete account?', 'Type DELETE to confirm. This is a destructive-action pattern only.', true, () => showToast('Typed confirmation pattern passed.'));

function updateOnboarding() {
  $$('.onboarding-step').forEach(step => step.classList.toggle('active', Number(step.dataset.step) === onboardingStep));
  $('#stepper').textContent = `Step ${onboardingStep} of 6`;
  $('#prevStep').disabled = onboardingStep === 1;
  $('#nextStep').textContent = onboardingStep === 6 ? 'Start Execution' : 'Next';
}
$('#prevStep').onclick = () => { onboardingStep = Math.max(1, onboardingStep - 1); updateOnboarding(); };
$('#nextStep').onclick = () => {
  if (onboardingStep === 1 && !$('#businessIdea').value.trim()) { showToast('Describe the business before continuing.'); return; }
  if (onboardingStep < 6) { onboardingStep++; updateOnboarding(); return; }
  $('#launchStrip').innerHTML = '<span class="tag demo">[SEEDED]</span> &gt; Engine handoff pattern started — no real execution performed.';
  appendLog('> [SEEDED] Onboarding handoff created first labeled log line.');
  showToast('Business launch pattern complete. Routing to Command Center.');
  setTimeout(() => showScreen('command'), 900);
};
renderActivity();
updateOnboarding();
