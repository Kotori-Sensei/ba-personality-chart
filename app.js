const MAX_STUDENTS = 5;
const STORAGE_KEY = 'student-sync-v2';
const LEGACY_STORAGE_KEY = 'student-sync-v1';
const ROSTER_FEED = 'https://yuzutrends.app/txt/en/students.txt';
const COLORS = ['#7960ef', '#f27fa9', '#4cc0b7', '#f2b84b', '#6c9bef'];
// Keep a complete roster inside the app script as an offline fallback.
// This prevents a missing data/ subfolder from breaking student search.
const BUNDLED_ROSTER = [
  [10000, "Aru"],
  [10001, "Eimi"],
  [10002, "Haruna"],
  [10003, "Hifumi"],
  [10004, "Hina"],
  [10005, "Hoshino"],
  [10006, "Iori"],
  [10007, "Maki"],
  [10008, "Neru"],
  [10009, "Izumi"],
  [10010, "Shiroko"],
  [10011, "Shun"],
  [10012, "Sumire"],
  [10013, "Tsurugi"],
  [10014, "Izuna"],
  [10015, "Aris"],
  [10016, "Midori"],
  [10017, "Cherino"],
  [10018, "Yuzu"],
  [10019, "Azusa"],
  [10020, "Koharu"],
  [10021, "Azusa (Swimsuit)"],
  [10022, "Hina (Swimsuit)"],
  [10023, "Iori (Swimsuit)"],
  [10024, "Shiroko (Cycling)"],
  [10025, "Shun (Small)"],
  [10026, "Neru (Bunny)"],
  [10027, "Karin (Bunny)"],
  [10028, "Asuna (Bunny)"],
  [10029, "Natsu"],
  [10030, "Chinatsu (Hot Spring)"],
  [10031, "Aru (New Year)"],
  [10032, "Mutsuki (New Year)"],
  [10033, "Wakamo"],
  [10034, "Mimori"],
  [10035, "Ui"],
  [10036, "Hinata"],
  [10037, "Marina"],
  [10038, "Miyako"],
  [10039, "Miyu"],
  [10040, "Tsukuyo"],
  [10041, "Misaki"],
  [10042, "Atsuko"],
  [10043, "Wakamo (Swimsuit)"],
  [10044, "Nonomi (Swimsuit)"],
  [10045, "Hoshino (Swimsuit)"],
  [10046, "Izuna (Swimsuit)"],
  [10047, "Chise (Swimsuit)"],
  [10048, "Saori"],
  [10049, "Kazusa"],
  [10050, "Kokona"],
  [10051, "Utaha (Cheer Squad)"],
  [10052, "Noa"],
  [10053, "Yuuka (Track)"],
  [10054, "Mari (Track)"],
  [10055, "Shigure"],
  [10056, "Serina (Christmas)"],
  [10057, "Haruna (New Year)"],
  [10058, "Mine"],
  [10059, "Mika"],
  [10060, "Megu"],
  [10061, "Sakurako"],
  [10062, "Toki"],
  [10063, "Koyuki"],
  [10064, "Kayoko (New Year)"],
  [10065, "Kaho"],
  [10066, "Aris (Maid)"],
  [10067, "Toki (Bunny)"],
  [10068, "Reisa"],
  [10069, "Rumi"],
  [10070, "Mina"],
  [10071, "Miyako (Swimsuit)"],
  [10072, "Saki (Swimsuit)"],
  [10073, "Ui (Swimsuit)"],
  [10074, "Hanako (Swimsuit)"],
  [10075, "Meru"],
  [10076, "Kotori (Cheer Squad)"],
  [10077, "Ichika"],
  [10078, "Kasumi"],
  [10079, "Misaka Mikoto"],
  [10080, "Shokuhou Misaki"],
  [10081, "Yukari"],
  [10082, "Renge"],
  [10083, "Kikyou"],
  [10084, "Kotama (Camp)"],
  [10085, "Hare (Camp)"],
  [10086, "Hina (Dress)"],
  [10087, "Ako (Dress)"],
  [10088, "Kayoko (Dress)"],
  [10089, "Aru (Dress)"],
  [10090, "Umika"],
  [10091, "Kazusa (Band)"],
  [10092, "Yoshimi (Band)"],
  [10093, "Kirara"],
  [10094, "Momoi (Maid)"],
  [10095, "Midori (Maid)"],
  [10096, "Kanna (Swimsuit)"],
  [10097, "Moe (Swimsuit)"],
  [10098, "Hoshino (Armed)"],
  [10099, "Hoshino (Armed)"],
  [10100, "Shiroko*Terror"],
  [10101, "Saori (Swimsuit)"],
  [10102, "Hiyori (Swimsuit)"],
  [10103, "Marina (Qipao)"],
  [10104, "Reijo"],
  [10105, "Mari (Pop Idol)"],
  [10106, "Sakurako (Pop Idol)"],
  [10107, "Chiaki"],
  [10108, "Yuuka (Pajamas)"],
  [10109, "Noa (Pajamas)"],
  [10110, "Seia"],
  [10111, "Neru (School)"],
  [10112, "Asuna (School)"],
  [10113, "Sena (Casual)"],
  [10114, "Juri (Part-Timer)"],
  [10115, "Rei"],
  [10116, "Saori (Dress)"],
  [10117, "Hikari"],
  [10118, "Nozomi"],
  [10119, "Nagusa"],
  [10120, "Natsu (Band)"],
  [10121, "Yukari (Swimsuit)"],
  [10122, "Mika (Swimsuit)"],
  [10123, "Seia (Swimsuit)"],
  [10124, "Hasumi (Swimsuit)"],
  [10125, "Eri"],
  [10126, "Kanoe"],
  [10127, "Miyo"],
  [10128, "Fuyu"],
  [10129, "Suzumi (Magical)"],
  [10130, "Subaru"],
  [10131, "Takane"],
  [10132, "Tsukuyo (Dress)"],
  [10133, "Rio (Armed)"],
  [10134, "Aris (Armed)"],
  [10135, "Kei"],
  [10136, "Eimi (Armed)"],
  [10137, "Konoka"],
  [10138, "Rena"],
  [10139, "Niko"],
  [10140, "Kurumi"],
  [10141, "Haruka (Dress)"],
  [10142, "Nagusa (Swimsuit)"],
  [10143, "Shun (Swimsuit)"],
  [10144, "Shunling (Swimsuit)"],
  [10145, "Kisaki (Swimsuit)"],
  [10146, "Makoto (Swimsuit)"],
  [10147, "Satsuki (Swimsuit)"],
  [10148, "Iroha (Swimsuit)"],
  [10149, "Kokoro"],
  [10150, "Kotone"],
  [10151, "Anna"],
  [10152, "Tsumugi"],
  [13000, "Akane"],
  [13001, "Chise"],
  [13002, "Akari"],
  [13003, "Hasumi"],
  [13004, "Nonomi"],
  [13005, "Kayoko"],
  [13006, "Mutsuki"],
  [13007, "Junko"],
  [13008, "Serika"],
  [13009, "Tsubaki"],
  [13010, "Yuuka"],
  [13011, "Momoi"],
  [13012, "Kirino"],
  [13013, "Momiji"],
  [13014, "Renge (Swimsuit)"],
  [16000, "Haruka"],
  [16001, "Asuna"],
  [16002, "Kotori"],
  [16003, "Suzumi"],
  [16004, "Pina"],
  [16005, "Tsurugi (Swimsuit)"],
  [16006, "Izumi (Swimsuit)"],
  [16007, "Tomoe"],
  [16008, "Fubuki"],
  [16009, "Michiru"],
  [16010, "Hibiki (Cheer Squad)"],
  [16011, "Hasumi (Track)"],
  [16012, "Junko (New Year)"],
  [16013, "Koharu (Swimsuit)"],
  [16014, "Ibuki"],
  [16015, "Airi (Band)"],
  [16016, "Mine (Pop Idol)"],
  [16017, "Aoba"],
  [16018, "Rabu"],
  [16019, "Toki (Armed)"],
  [16020, "Otogi"],
  [20000, "Hibiki"],
  [20001, "Karin"],
  [20002, "Saya"],
  [20003, "Mashiro"],
  [20004, "Mashiro (Swimsuit)"],
  [20005, "Hifumi (Swimsuit)"],
  [20006, "Saya (Casual)"],
  [20007, "Hatsune Miku"],
  [20008, "Ako"],
  [20009, "Cherino (Hot Spring)"],
  [20010, "Nodoka (Hot Spring)"],
  [20011, "Serika (New Year)"],
  [20012, "Sena"],
  [20013, "Chihiro"],
  [20014, "Saki"],
  [20015, "Kaede"],
  [20016, "Iroha"],
  [20017, "Hiyori"],
  [20018, "Moe"],
  [20019, "Akane (Bunny)"],
  [20020, "Himari"],
  [20021, "Hanae (Christmas)"],
  [20022, "Fuuka (New Year)"],
  [20023, "Kanna"],
  [20024, "Nagisa"],
  [20025, "Haruka (New Year)"],
  [20026, "Minori"],
  [20027, "Shiroko (Swimsuit)"],
  [20028, "Hinata (Swimsuit)"],
  [20029, "Mimori (Swimsuit)"],
  [20030, "Haruna (Track)"],
  [20031, "Shigure (Hot Spring)"],
  [20032, "Eimi (Swimsuit)"],
  [20033, "Makoto"],
  [20034, "Akari (New Year)"],
  [20035, "Tsubaki (Guide)"],
  [20036, "Serika (Swimsuit)"],
  [20037, "Fubuki (Swimsuit)"],
  [20038, "Tomoe (Qipao)"],
  [20039, "Kisaki"],
  [20040, "Satsuki"],
  [20041, "Rio"],
  [20042, "Maki (Camp)"],
  [20043, "Izumi (New Year)"],
  [20044, "Sumire (Part-Timer)"],
  [20045, "Pina (Guide)"],
  [20046, "Niya"],
  [20047, "Kikyou (Swimsuit)"],
  [20048, "Nagisa (Swimsuit)"],
  [20049, "Misaki (Swimsuit)"],
  [20050, "Ritsu"],
  [20051, "Reisa (Magical)"],
  [20052, "Yakumo"],
  [20053, "Michiru (Dress)"],
  [20054, "Himari (Armed)"],
  [20055, "Yuzu (Armed)"],
  [20056, "Koyuki (Pajamas)"],
  [20057, "Akane (School)"],
  [20058, "Erika"],
  [20059, "Mutsuki (Dress)"],
  [20060, "Ibuki (Swimsuit)"],
  [20061, "Kasumi (Swimsuit)"],
  [20062, "Erina"],
  [23000, "Airi"],
  [23001, "Fuuka"],
  [23002, "Hanae"],
  [23003, "Hare"],
  [23004, "Utaha"],
  [23005, "Ayane"],
  [23006, "Shizuko"],
  [23007, "Hanako"],
  [23008, "Mari"],
  [26000, "Chinatsu"],
  [26001, "Kotama"],
  [26002, "Juri"],
  [26003, "Serina"],
  [26004, "Shimiko"],
  [26005, "Yoshimi"],
  [26006, "Nodoka"],
  [26007, "Ayane (Swimsuit)"],
  [26008, "Shizuko (Swimsuit)"],
  [26009, "Yuzu (Maid)"],
  [26010, "Miyu (Swimsuit)"],
  [26011, "Saten Ruiko"],
  [26012, "Kirino (Swimsuit)"],
  [26013, "Atsuko (Swimsuit)"],
  [26014, "Karin (School)"],
  [26015, "Ichika (Swimsuit)"],
  [26016, "Chiaki (Swimsuit)"],
];
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
  // Install the embedded snapshot before any network request so search is always
  // available, including when GitHub Pages cannot serve the data/ directory.
  installRoster(BUNDLED_ROSTER);
  setHint(`Loaded ${roster.length} playable roster entries with portraits. Checking for updates…`);
  try {
    const current = await fetchCurrentRoster();
    installRoster(current);
    setHint(`Loaded ${roster.length} playable roster entries and portraits. The list is up to date.`);
  } catch { setHint(`Loaded all ${roster.length} bundled playable roster entries and portraits. Live updates are unavailable right now.`); }
}

render();
loadRoster();
