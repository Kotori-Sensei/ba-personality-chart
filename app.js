const MAX_STUDENTS = 5;
const STORAGE_KEY = 'student-sync-v2';
const LEGACY_STORAGE_KEY = 'student-sync-v1';
const ROSTER_FEED = 'https://yuzutrends.app/txt/en/students.txt';
const COLORS = ['#7960ef', '#f27fa9', '#4cc0b7', '#f2b84b', '#6c9bef'];
const studentList = document.querySelector('#student-list');
const studentSearch = document.querySelector('#student-search');
const studentOptions = document.querySelector('#student-options');
const form = document.querySelector('#student-form');
const hint = document.querySelector('#form-hint');
const count = document.querySelector('#student-count');
const emptyState = document.querySelector('#empty-state');
const chartEmpty = document.querySelector('#chart-empty');
const chartContent = document.querySelector('#chart-content');
const pie = document.querySelector('#pie-chart');
const orbitStudents = document.querySelector('#orbit-students');
const legend = document.querySelector('#legend');
const total = document.querySelector('#match-total');
const addButton = document.querySelector('#add-button');
let roster = [];
let rosterReady = false;
let selections = loadSelections();

function clamp(value) { return Math.max(0, Math.min(100, Math.round(Number.isFinite(value) ? value : 0))); }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function normalizedTitle(value) { return String(value).replace(/_/g, ' ').trim().toLocaleLowerCase(); }
function initials(name) { return name.trim().split(/\s+/).map(part => part[0]).slice(0,2).join('').toUpperCase(); }
function portraitUrl(student) { return student.image || `https://schaledb.com/images/student/collection/${student.id}.webp`; }
function fallbackPortraitUrl(student) { return `https://raw.githubusercontent.com/SchaleDB/SchaleDB/main/images/student/collection/${student.id}.webp`; }
function setHint(message, isError = false) { hint.textContent = message; hint.classList.toggle('error', isError); }
function studentLabel(student) { return student.displayName || student.name; }

function loadSelections() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter(item => item && (typeof item.name === 'string' || Number.isFinite(Number(item.id))))
      .slice(0, MAX_STUDENTS).map(item => ({id:Number(item.id) || null, name:String(item.name || ''), score:clamp(Number(item.score) || 0)})) : [];
  } catch { return []; }
}
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(selections)); localStorage.removeItem(LEGACY_STORAGE_KEY); }
  catch { /* Keep the page usable when browser storage is unavailable. */ }
}

function normalizeRecord(record) {
  if (Array.isArray(record)) return {id:Number(record[0]), name:String(record[1] || '').trim()};
  return {id:Number(record?.id), name:String(record?.name || '').trim(), image:record?.image || ''};
}
function withUniqueLabels(records) {
  const counts = new Map();
  records.forEach(student => counts.set(normalizedTitle(student.name), (counts.get(normalizedTitle(student.name)) || 0) + 1));
  return records.map(student => ({...student, displayName:counts.get(normalizedTitle(student.name)) > 1 ? `${student.name} · ${student.id}` : student.name}));
}
function reconcileSelections() {
  selections = selections.map(selected => {
    const match = roster.find(student => selected.id && student.id === selected.id)
      || roster.find(student => normalizedTitle(student.name) === normalizedTitle(selected.name));
    return match ? {id:match.id, name:match.name, score:selected.score} : selected;
  });
  save();
}
function installRoster(records) {
  const unique = new Map();
  records.map(normalizeRecord).filter(student => Number.isFinite(student.id) && student.name).forEach(student => unique.set(student.id, student));
  if (!unique.size) throw new Error('The student source returned an empty list.');
  roster = withUniqueLabels([...unique.values()].sort((a,b) => a.name.localeCompare(b.name) || a.id - b.id));
  rosterReady = true;
  reconcileSelections();
  studentOptions.innerHTML = roster.map(student => `<option value="${escapeHtml(studentLabel(student))}"></option>`).join('');
  render();
}

function parseStudentFeed(text) {
  const lines = text.split(/\r?\n/).filter(line => line && !line.startsWith('#'));
  const header = lines.shift()?.split('\t');
  if (!header || header[0] !== 'Id' || header[1] !== 'Name') throw new Error('The student feed format was not recognized.');
  return lines.map(line => {
    const [id, name] = line.split('\t');
    return {id:Number(id), name};
  }).filter(student => Number.isFinite(student.id) && student.name);
}
async function fetchCurrentRoster() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(ROSTER_FEED, {signal:controller.signal, cache:'no-cache', credentials:'omit'});
    if (!response.ok) throw new Error(`Student feed returned ${response.status}.`);
    const records = parseStudentFeed(await response.text());
    if (records.length < 100) throw new Error('The student feed was incomplete.');
    return records;
  } finally { clearTimeout(timeout); }
}

function addStudent(input) {
  const query = input.trim();
  const match = roster.find(student => normalizedTitle(studentLabel(student)) === normalizedTitle(query))
    || roster.find(student => normalizedTitle(student.name) === normalizedTitle(query));
  if (!match) { setHint('Choose a name from the student list to add it.', true); return false; }
  if (selections.some(item => item.id === match.id)) { setHint(`${studentLabel(match)} is already in your lineup.`, true); return false; }
  if (selections.length >= MAX_STUDENTS) { setHint('Your lineup is full. Remove a student to add another.', true); return false; }
  selections.push({id:match.id, name:match.name, score:50});
  save(); render();
  setHint(`${studentLabel(match)} added. Set the slider to your similarity rating.`);
  return true;
}

function render() {
  count.textContent = `${selections.length} / ${MAX_STUDENTS}`;
  addButton.disabled = selections.length >= MAX_STUDENTS || !rosterReady;
  emptyState.hidden = selections.length > 0;
  studentList.innerHTML = selections.map((item, index) => {
    const color = COLORS[index % COLORS.length];
    const student = roster.find(candidate => candidate.id === item.id) || item;
    const name = studentLabel(student);
    const safeName = escapeHtml(name);
    const image = student.id ? portraitUrl(student) : '';
    const id = `score-${index}`;
    return `<article class="student-card">
      <div class="student-avatar" style="background:${color}"><span aria-hidden="true">${escapeHtml(initials(item.name))}</span>${image ? `<img src="${escapeHtml(image)}" data-fallback="${escapeHtml(fallbackPortraitUrl(student))}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ''}</div>
      <div><div class="student-name">${safeName}</div><div class="student-label">Your similarity rating</div></div>
      <button type="button" class="remove-button" aria-label="Remove ${safeName}" data-remove="${index}">×</button>
      <div class="score-line"><label class="sr-only" for="${id}">How much you relate to ${safeName}</label><input class="slider" id="${id}" type="range" min="0" max="100" value="${item.score}" style="--fill:${item.score}%" data-score="${index}"><output class="score-value" for="${id}">${item.score}<small>%</small></output></div>
    </article>`;
  }).join('');
  attachImageFallbacks(studentList);
  studentList.querySelectorAll('[data-remove]').forEach(button => button.addEventListener('click', () => {
    const removed = selections.splice(Number(button.dataset.remove), 1)[0]; save(); render(); setHint(`${removed.name} removed from your lineup.`);
  }));
  studentList.querySelectorAll('[data-score]').forEach(slider => slider.addEventListener('input', () => {
    const index = Number(slider.dataset.score);
    selections[index].score = clamp(Number(slider.value));
    slider.style.setProperty('--fill', `${slider.value}%`);
    slider.nextElementSibling.innerHTML = `${slider.value}<small>%</small>`;
    save(); renderChart();
  }));
  renderChart();
}

function attachImageFallbacks(container) {
  container.querySelectorAll('img').forEach(image => image.addEventListener('error', () => {
    const backup = image.dataset.fallback;
    if (backup && image.src !== backup) { image.dataset.fallback = ''; image.src = backup; }
    else image.remove();
  }));
}

function renderOrbitStudents(sum) {
  const orbitSize = orbitStudents.parentElement.clientWidth || 288;
  const radius = Math.max(0, (orbitSize - 82) / 2);
  let angle = -Math.PI / 2;
  orbitStudents.setAttribute('role', 'list');
  orbitStudents.innerHTML = selections.map((item, index) => {
    const portion = sum ? item.score / sum : 1 / Math.max(1, selections.length);
    const midpoint = angle + portion * Math.PI;
    const left = orbitSize / 2 + radius * Math.cos(midpoint);
    const top = orbitSize / 2 + radius * Math.sin(midpoint);
    angle += sum ? portion * Math.PI * 2 : portion * Math.PI * 2;
    const color = COLORS[index % COLORS.length];
    const pct = sum ? Math.round((item.score / sum) * 100) : 0;
    const student = roster.find(candidate => candidate.id === item.id) || item;
    const safeName = escapeHtml(studentLabel(student));
    const image = student.id ? portraitUrl(student) : '';
    return `<div class="orbit-student" role="listitem" style="left:${left}px;top:${top}px;--student-color:${color}" aria-label="${safeName}, ${pct}% of your chart">
      <span class="orbit-avatar" style="background:${color}"><span aria-hidden="true">${escapeHtml(initials(item.name))}</span>${image ? `<img src="${escapeHtml(image)}" data-fallback="${escapeHtml(fallbackPortraitUrl(student))}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ''}</span>
      <span class="orbit-name">${safeName}</span>
    </div>`;
  }).join('');
  attachImageFallbacks(orbitStudents);
}

function renderChart() {
  const hasStudents = selections.length > 0;
  chartEmpty.hidden = hasStudents;
  chartContent.hidden = !hasStudents;
  if (!hasStudents) return;
  const sum = selections.reduce((result, item) => result + item.score, 0);
  total.textContent = sum;
  legend.innerHTML = selections.map((item, i) => {
    const portion = sum ? item.score / sum : 0;
    const student = roster.find(candidate => candidate.id === item.id) || item;
    return `<div class="legend-row"><span class="legend-dot" style="background:${COLORS[i % COLORS.length]}"></span><span class="legend-name">${escapeHtml(studentLabel(student))}</span><span class="legend-percent">${Math.round(portion * 100)}%</span></div>`;
  }).join('');
  renderOrbitStudents(sum);
  pie.innerHTML = '';
  if (!sum) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx','120'); circle.setAttribute('cy','120'); circle.setAttribute('r','91'); circle.setAttribute('fill','#e9e6f2'); pie.append(circle);
    return;
  }
  let angle = 0;
  selections.forEach((item, i) => {
    if (item.score <= 0) return;
    const portion = item.score / sum;
    const next = angle + portion * Math.PI * 2;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', sectorPath(120, 120, 92, angle, next));
    path.setAttribute('fill', COLORS[i % COLORS.length]);
    path.setAttribute('class', 'pie-segment');
    path.setAttribute('aria-label', `${item.name}: ${Math.round(portion * 100)} percent`);
    pie.append(path);
    angle = next;
  });
}
function sectorPath(cx, cy, radius, start, end) {
  if (end - start > Math.PI * 2 - 0.0001) end = start + Math.PI * 2 - 0.0001;
  const x1 = cx + radius * Math.cos(start), y1 = cy + radius * Math.sin(start);
  const x2 = cx + radius * Math.cos(end), y2 = cy + radius * Math.sin(end);
  const largeArc = end - start > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

form.addEventListener('submit', event => {
  event.preventDefault();
  if (selections.length >= MAX_STUDENTS) { setHint('Your lineup is full. Remove a student to add another.', true); return; }
  if (addStudent(studentSearch.value)) studentSearch.value = '';
});
document.querySelector('#reset-button').addEventListener('click', () => {
  selections = []; localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(LEGACY_STORAGE_KEY); studentSearch.value = ''; setHint('Your lineup is clear. Choose some students to begin.'); render();
});

async function loadRoster() {
  setHint('Loading the complete student list…');
  let bundledError = null;
  try {
    const response = await fetch('data/students.json', {cache:'no-cache'});
    if (!response.ok) throw new Error('Could not load the bundled student list.');
    const bundled = await response.json();
    installRoster(bundled.students || bundled);
    setHint(`Loaded ${roster.length} playable roster entries with portraits. Checking for updates…`);
  } catch (error) { bundledError = error; }

  try {
    const current = await fetchCurrentRoster();
    installRoster(current);
    setHint(`Loaded ${roster.length} playable roster entries and portraits. The list is up to date.`);
  } catch (error) {
    if (rosterReady) setHint(`Loaded all ${roster.length} bundled playable roster entries and their portraits. Live updates are unavailable right now.`);
    else setHint('The student list could not be loaded. Check your connection and refresh the page.', true);
    if (bundledError) console.error('Roster load failed:', bundledError, error);
  }
}

render();
loadRoster();
