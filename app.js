const MAX_STUDENTS = 5;
const STORAGE_KEY = 'student-sync-v1';
const FANDOM_API = 'https://bluearchive.fandom.com/api.php';
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
let studentImages = new Map();
let rosterReady = false;
let selections = loadSelections();

function loadSelections() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter(item => item && typeof item.name === 'string').slice(0, MAX_STUDENTS).map(item => ({name:item.name, score:clamp(Number(item.score) || 0)})) : [];
  } catch { return []; }
}
function clamp(value) { return Math.max(0, Math.min(100, Math.round(Number.isFinite(value) ? value : 0))); }
function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(selections)); } catch { /* Keep the page usable when browser storage is unavailable. */ } }
function normalizedTitle(value) { return value.replace(/_/g, ' ').trim().toLocaleLowerCase(); }
function escapeHtml(value) { return value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function initials(name) { return name.trim().split(/\s+/).map(part => part[0]).slice(0,2).join('').toUpperCase(); }
function setHint(message, isError) { hint.textContent = message; hint.classList.toggle('error', isError); }

async function apiRequest(params) {
  const url = new URL(FANDOM_API);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {signal:controller.signal, credentials:'omit'});
    if (!response.ok) throw new Error(`Fandom API returned ${response.status}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error.info || 'Fandom API returned an error');
    return data;
  } finally { clearTimeout(timeout); }
}

async function fetchWikiRoster() {
  const titles = [];
  let continuation = null;
  let pagesRead = 0;
  do {
    const params = {action:'query', list:'categorymembers', cmtitle:'Category:Students', cmtype:'page', cmnamespace:'0', cmlimit:'max'};
    if (continuation) Object.entries(continuation).forEach(([key,value]) => params[key] = value);
    const data = await apiRequest(params);
    const members = data.query?.categorymembers || [];
    titles.push(...members.filter(page => page.ns === 0).map(page => page.title));
    continuation = data.continue || null;
    pagesRead += 1;
    if (pagesRead > 100) throw new Error('The student list pagination limit was reached.');
  } while (continuation);

  const uniqueTitles = [...new Set(titles.map(title => title.replace(/_/g, ' ')))].sort((a,b) => a.localeCompare(b));
  if (!uniqueTitles.length) throw new Error('The Fandom category returned no student pages.');

  const images = new Map();
  let imageError = false;
  // MediaWiki accepts batches of titles for PageImages; keep requests modest and sequential.
  for (let i=0; i<uniqueTitles.length; i+=50) {
    const batch = uniqueTitles.slice(i, i+50);
    try {
      const data = await apiRequest({action:'query', prop:'pageimages', piprop:'thumbnail', pithumbsize:'240', redirects:'1', titles:batch.join('|')});
      for (const page of Object.values(data.query?.pages || {})) {
        const imageUrl = page.thumbnail?.source || page.original?.source;
        if (imageUrl) images.set(normalizedTitle(page.title), imageUrl);
      }
    } catch { imageError = true; break; }
  }
  return {students:uniqueTitles, images, imageError};
}

function addStudent(name) {
  const match = roster.find(item => item.toLocaleLowerCase() === name.trim().toLocaleLowerCase());
  if (!match) { setHint('Choose a name from the student list to add it.', true); return false; }
  if (selections.some(item => item.name === match)) { setHint(`${match} is already in your lineup.`, true); return false; }
  if (selections.length >= MAX_STUDENTS) { setHint('Your lineup is full. Remove a student to add another.', true); return false; }
  selections.push({name:match, score:50});
  save(); render();
  setHint(`${match} added. Set the slider to your similarity rating.`, false);
  return true;
}

function render() {
  count.textContent = `${selections.length} / ${MAX_STUDENTS}`;
  addButton.disabled = selections.length >= MAX_STUDENTS || !rosterReady;
  emptyState.hidden = selections.length > 0;
  studentList.innerHTML = selections.map((item, index) => {
    const color = COLORS[index % COLORS.length];
    const safeName = escapeHtml(item.name);
    const image = studentImages.get(normalizedTitle(item.name));
    const id = `score-${index}`;
    return `<article class="student-card">
      <div class="student-avatar" style="background:${color}"><span aria-hidden="true">${escapeHtml(initials(item.name))}</span>${image ? `<img src="${escapeHtml(image)}" alt="" loading="lazy">` : ''}</div>
      <div><div class="student-name">${safeName}</div><div class="student-label">Your similarity rating</div></div>
      <button type="button" class="remove-button" aria-label="Remove ${safeName}" data-remove="${index}">×</button>
      <div class="score-line"><label class="sr-only" for="${id}">How much you relate to ${safeName}</label><input class="slider" id="${id}" type="range" min="0" max="100" value="${item.score}" style="--fill:${item.score}%" data-score="${index}"><output class="score-value" for="${id}">${item.score}<small>%</small></output></div>
    </article>`;
  }).join('');
  studentList.querySelectorAll('.student-avatar img').forEach(image => image.addEventListener('error', () => image.remove(), {once:true}));
  studentList.querySelectorAll('[data-remove]').forEach(button => button.addEventListener('click', () => {
    const removed = selections.splice(Number(button.dataset.remove), 1)[0]; save(); render(); setHint(`${removed.name} removed from your lineup.`, false);
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

function renderOrbitStudents(sum) {
  const orbitSize = orbitStudents.parentElement.clientWidth || 288;
  const radius = Math.max(0, (orbitSize - 80) / 2 - 1);
  orbitStudents.setAttribute('role', 'list');
  orbitStudents.innerHTML = selections.map((item, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index / selections.length);
    const left = orbitSize / 2 + radius * Math.cos(angle);
    const top = orbitSize / 2 + radius * Math.sin(angle);
    const color = COLORS[index % COLORS.length];
    const portion = sum ? Math.round((item.score / sum) * 100) : 0;
    const image = studentImages.get(normalizedTitle(item.name));
    const safeName = escapeHtml(item.name);
    return `<div class="orbit-student" role="listitem" style="left:${left}px;top:${top}px;--student-color:${color}" aria-label="${safeName}, ${portion}% of your chart">
      <span class="orbit-avatar" style="background:${color}"><span aria-hidden="true">${escapeHtml(initials(item.name))}</span>${image ? `<img src="${escapeHtml(image)}" alt="" loading="lazy">` : ''}</span>
      <span class="orbit-name">${safeName}</span>
    </div>`;
  }).join('');
  orbitStudents.querySelectorAll('.orbit-avatar img').forEach(image => image.addEventListener('error', () => image.remove(), {once:true}));
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
    const pct = Math.round(portion * 100);
    return `<div class="legend-row"><span class="legend-dot" style="background:${COLORS[i % COLORS.length]}"></span><span class="legend-name">${escapeHtml(item.name)}</span><span class="legend-percent">${pct}%</span></div>`;
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
  const added = addStudent(studentSearch.value);
  if (added) studentSearch.value = '';
});
document.querySelector('#reset-button').addEventListener('click', () => {
  selections = []; localStorage.removeItem(STORAGE_KEY); studentSearch.value = ''; setHint('Your lineup is clear. Choose some students to begin.', false); render();
});

async function loadRoster() {
  setHint('Loading the complete student list and portraits from Fandom…', false);
  try {
    const data = await fetchWikiRoster();
    roster = data.students;
    studentImages = data.images;
    rosterReady = true;
    const savedNames = selections.map(item => item.name);
    roster = [...new Set([...roster, ...savedNames])];
    studentOptions.innerHTML = roster.map(name => `<option value="${escapeHtml(name)}"></option>`).join('');
    render();
    setHint(`Loaded ${data.students.length} student pages and ${data.images.size} portraits from the Fandom wiki.${data.imageError ? ' Some portraits could not be retrieved.' : ''}`, data.imageError);
  } catch (error) {
    try {
      const response = await fetch('data/students.json');
      if (!response.ok) throw new Error('Could not load the bundled roster.');
      const fallback = await response.json();
      roster = [...new Set([...fallback, ...selections.map(item => item.name)])].sort((a,b) => a.localeCompare(b));
      rosterReady = true;
      studentOptions.innerHTML = roster.map(name => `<option value="${escapeHtml(name)}"></option>`).join('');
      render();
      setHint(`Fandom could not be reached, so the starter list is shown (${roster.length} names). ${error.name === 'AbortError' ? 'The request timed out.' : 'Portraits may be unavailable.'}`, true);
    } catch (fallbackError) {
      setHint('Neither the Fandom API nor the bundled list could be loaded. Try refreshing the page.', true);
    }
  }
}

render();
loadRoster();
