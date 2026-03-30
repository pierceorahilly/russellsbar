/* ============================================================
   RUSSELLS – BOOKING SYSTEM
   ============================================================ */

// ─── STATE ──────────────────────────────────────────────────
const state = {
  guests: null,
  date:   null,
  step:   1,
};

// ─── CALENDAR ───────────────────────────────────────────────
let calYear, calMonth;

function initCalendar() {
  const now = new Date();
  calYear  = now.getFullYear();
  calMonth = now.getMonth();
  renderCalendar();
}

function renderCalendar() {
  const label = document.getElementById('calMonthLabel');
  const grid  = document.getElementById('calendarDays');
  if (!label || !grid) return;

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  label.textContent = `${months[calMonth]} ${calYear}`;

  const today   = new Date(); today.setHours(0,0,0,0);
  const maxDate = new Date(today); maxDate.setMonth(maxDate.getMonth() + 3);
  const firstDay = new Date(calYear, calMonth, 1);
  const lastDay  = new Date(calYear, calMonth + 1, 0);

  let startDow = firstDay.getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;

  grid.innerHTML = '';

  for (let i = 0; i < startDow; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-day empty';
    grid.appendChild(empty);
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date    = new Date(calYear, calMonth, d);
    const dateStr = date.toISOString().split('T')[0];
    const btn     = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cal-day';
    btn.textContent = d;

    const isPast     = date < today;
    const isFuture   = date > maxDate;
    const isToday    = date.getTime() === today.getTime();
    const isSelected = state.date && state.date.toISOString().split('T')[0] === dateStr;

    if (isPast || isFuture) {
      btn.classList.add('past');
      btn.disabled = true;
    } else {
      btn.classList.add('has-avail');
      btn.dataset.date = dateStr;
      btn.addEventListener('click', () => selectDate(date, btn));
    }
    if (isToday)    btn.classList.add('today');
    if (isSelected) btn.classList.add('selected');

    grid.appendChild(btn);
  }

  const now = new Date(); now.setHours(0,0,0,0);
  const prevBtn = document.getElementById('calPrev');
  const nextBtn = document.getElementById('calNext');
  if (prevBtn) prevBtn.disabled = (calYear === now.getFullYear() && calMonth <= now.getMonth());
  if (nextBtn) {
    const maxM = new Date(now); maxM.setMonth(maxM.getMonth() + 3);
    nextBtn.disabled = (calYear > maxM.getFullYear() || (calYear === maxM.getFullYear() && calMonth >= maxM.getMonth()));
  }
}

function selectDate(date, btn) {
  document.querySelectorAll('.cal-day.selected').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  state.date = date;

  const nextBtn = document.getElementById('step1Next');
  if (nextBtn) {
    nextBtn.disabled = false;
    nextBtn.textContent = 'Continue →';
  }
  updateSidebar();
}

document.getElementById('calPrev')?.addEventListener('click', () => {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar();
});
document.getElementById('calNext')?.addEventListener('click', () => {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendar();
});

// ─── STEP 1 NEXT ────────────────────────────────────────────
document.getElementById('step1Next')?.addEventListener('click', () => {
  if (!state.date) return;
  goToStep(2);
});

// ─── GUEST CHIPS ─────────────────────────────────────────────
document.querySelectorAll('.guest-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.guest-chip').forEach(c => c.classList.remove('selected'));
    chip.classList.add('selected');
    state.guests = chip.dataset.guests;
    const msg = document.getElementById('largePartyMsg');
    if (msg) msg.classList.toggle('show', chip.dataset.guests === '9');
    const nextBtn = document.getElementById('step2Next');
    if (nextBtn) nextBtn.disabled = chip.dataset.guests === '9';
    updateSidebar();
  });
});

document.getElementById('step2Next')?.addEventListener('click', () => {
  if (!state.guests) return;
  goToStep(3);
});

// ─── STEP NAVIGATION ────────────────────────────────────────
function goToStep(n) {
  document.querySelectorAll('.bstep').forEach((s, i) => {
    s.classList.toggle('active', i + 1 === n);
  });
  state.step = n;
  updateProgress();

  if (n === 2) {
    const sub = document.getElementById('step2Sub');
    if (sub && state.date) {
      const opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      sub.textContent = state.date.toLocaleDateString('en-IE', opts);
    }
  }

  if (n === 3) {
    const bar = document.getElementById('summaryBar3');
    if (bar && state.date) {
      const opts = { weekday: 'short', day: 'numeric', month: 'short' };
      bar.innerHTML = `
        <div class="summary-item"><strong>Date</strong>${state.date.toLocaleDateString('en-IE', opts)}</div>
        <div class="summary-item"><strong>Guests</strong>${state.guests}</div>
      `;
    }
  }

  window.scrollTo({ top: document.querySelector('.booking-main')?.offsetTop - 100 || 0, behavior: 'smooth' });
}

// ─── PROGRESS INDICATOR ─────────────────────────────────────
function updateProgress() {
  document.querySelectorAll('.progress-step').forEach((s, i) => {
    s.classList.remove('active', 'done');
    if (i + 1 === state.step) s.classList.add('active');
    if (i + 1 < state.step)  s.classList.add('done');
  });
  document.querySelectorAll('.progress-line').forEach((l, i) => {
    l.classList.toggle('done', i + 1 < state.step);
  });
}

// ─── LIVE SIDEBAR SUMMARY ────────────────────────────────────
function updateSidebar() {
  const rows = document.getElementById('summaryRows');
  if (!rows) return;

  const items = [];
  if (state.date) {
    const opts = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    items.push({ label: 'Date',   val: state.date.toLocaleDateString('en-IE', opts) });
  }
  if (state.guests) {
    items.push({ label: 'Guests', val: `${state.guests} ${parseInt(state.guests) === 1 ? 'guest' : 'guests'}` });
  }

  if (items.length === 0) {
    rows.innerHTML = '<div class="summary-empty">Select a date to see your booking summary here.</div>';
    return;
  }
  rows.innerHTML = items.map(i => `
    <div class="summary-row">
      <span class="sr-label">${i.label}</span>
      <span class="sr-val">${i.val}</span>
    </div>
  `).join('');
}

// ─── FORM SUBMISSION ─────────────────────────────────────────
function submitBooking() {
  const fields = ['firstName','lastName','email','phone'];
  let valid = true;

  fields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('error');
    if (!el.value.trim()) {
      el.classList.add('error');
      valid = false;
    }
  });

  if (!valid) {
    alert('Please fill in all required fields.');
    return;
  }

  const firstName = document.getElementById('firstName').value.trim();
  const lastName  = document.getElementById('lastName').value.trim();
  const email     = document.getElementById('email').value.trim();
  const phone     = document.getElementById('phone').value.trim();
  const occasion  = document.getElementById('occasion').value;
  const requests  = document.getElementById('requests').value.trim();
  const carvery   = document.getElementById('carveryOpt').checked;

  const dateOpts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const dateStr  = state.date.toLocaleDateString('en-IE', dateOpts);

  const rows = [
    { label: 'Name',   val: `${firstName} ${lastName}` },
    { label: 'Date',   val: dateStr },
    { label: 'Guests', val: state.guests },
    { label: 'Phone',  val: phone },
  ];
  if (occasion) rows.push({ label: 'Occasion', val: occasion });
  if (carvery)  rows.push({ label: 'Carvery',  val: 'Yes ✓' });
  if (requests) rows.push({ label: 'Requests', val: requests });

  document.getElementById('confName').textContent  = `${firstName} ${lastName}`;
  document.getElementById('confEmail').textContent = email;
  document.getElementById('confCard').innerHTML    = rows.map(r => `
    <div class="conf-row">
      <strong>${r.label}</strong>
      <span>${r.val}</span>
    </div>
  `).join('');

  goToStep(4);
}

function newBooking() {
  state.guests = null; state.date = null; state.step = 1;

  ['firstName','lastName','email','phone'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('occasion').value = '';
  document.getElementById('requests').value = '';
  document.getElementById('carveryOpt').checked = false;
  document.getElementById('privacyOpt').checked = false;

  document.querySelectorAll('.guest-chip').forEach(c => c.classList.remove('selected'));

  initCalendar();
  goToStep(1);
  updateSidebar();

  const nextBtn = document.getElementById('step1Next');
  if (nextBtn) { nextBtn.disabled = true; nextBtn.textContent = 'Select a date to continue →'; }
  const step2Next = document.getElementById('step2Next');
  if (step2Next) step2Next.disabled = true;
}

// ─── INIT ────────────────────────────────────────────────────
initCalendar();
updateProgress();
