// ─── MENU LIGHTBOX ───────────────────────────────────────────
const menuImg    = document.getElementById('menuImg');
const lightbox   = document.getElementById('menuLightbox');
const lightboxClose = document.getElementById('lightboxClose');
if (menuImg && lightbox) {
  const lbImg = lightbox.querySelector('.lightbox-img');
  let scale = 1;

  menuImg.addEventListener('click', () => {
    scale = 1;
    lbImg.style.transform = 'scale(1)';
    lightbox.classList.add('open');
  });
  lightboxClose.addEventListener('click', () => lightbox.classList.remove('open'));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.classList.remove('open');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') lightbox.classList.remove('open');
  });
  lightbox.addEventListener('wheel', (e) => {
    e.preventDefault();
    scale += e.deltaY < 0 ? 0.1 : -0.1;
    scale = Math.min(Math.max(scale, 0.5), 5);
    lbImg.style.transform = `scale(${scale})`;
  }, { passive: false });
}

// ─── CARVERY IMAGE AUTO-SCROLL ───────────────────────────────
const carveryScroll = document.querySelector('.carvery-scroll');
if (carveryScroll) {
  let current = 0;
  const imgs = carveryScroll.querySelectorAll('img');
  setInterval(() => {
    current = (current + 1) % imgs.length;
    carveryScroll.scrollTo({ left: imgs[current].offsetLeft, behavior: 'smooth' });
  }, 3000);
}

// ─── NAVBAR (transparent → solid on scroll) ──────────────────
const navbar = document.getElementById('navbar');
if (navbar) {
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ─── MOBILE NAV TOGGLE ───────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// ─── BOOKING: MULTI-STEP FORM ────────────────────────────────
function nextStep(currentStep) {
  if (!validateStep(currentStep)) return;
  document.getElementById(`step${currentStep}`).classList.remove('active');
  document.getElementById(`step${currentStep + 1}`).classList.add('active');
  window.scrollTo({ top: document.querySelector('.booking-form-wrap').offsetTop - 100, behavior: 'smooth' });
}

function prevStep(currentStep) {
  document.getElementById(`step${currentStep}`).classList.remove('active');
  document.getElementById(`step${currentStep - 1}`).classList.add('active');
}

function validateStep(step) {
  const stepEl = document.getElementById(`step${step}`);
  if (!stepEl) return true;
  const required = stepEl.querySelectorAll('[required]');
  let valid = true;
  required.forEach(field => {
    field.classList.remove('input-error');
    if (!field.value.trim()) {
      field.classList.add('input-error');
      field.style.borderColor = '#e74c3c';
      valid = false;
    } else {
      field.style.borderColor = '';
    }
  });
  if (step === 2) {
    const timeInput = document.getElementById('selectedTime');
    if (!timeInput || !timeInput.value) {
      alert('Please select a time slot.');
      valid = false;
    }
    const dateInput = document.getElementById('date');
    if (dateInput && dateInput.value) {
      const chosen = new Date(dateInput.value);
      const today  = new Date(); today.setHours(0,0,0,0);
      if (chosen < today) {
        dateInput.style.borderColor = '#e74c3c';
        alert('Please select a future date.');
        valid = false;
      }
    }
  }
  return valid;
}

// ─── TIME SLOT SELECTION ─────────────────────────────────────
document.querySelectorAll('.time-slot').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    const hiddenInput = document.getElementById('selectedTime');
    if (hiddenInput) hiddenInput.value = btn.dataset.time;
  });
});

// ─── FORM SUBMISSION ─────────────────────────────────────────
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateStep(3)) return;

    const privacyCheck = document.getElementById('privacy');
    if (privacyCheck && !privacyCheck.checked) {
      alert('Please agree to the privacy terms to proceed.');
      return;
    }

    // Gather data
    const firstName = document.getElementById('firstName').value;
    const lastName  = document.getElementById('lastName').value;
    const email     = document.getElementById('email').value;
    const phone     = document.getElementById('phone').value;
    const date      = document.getElementById('date').value;
    const guests    = document.getElementById('guests').value;
    const time      = document.getElementById('selectedTime').value;
    const occasion  = document.getElementById('occasion').value;
    const carvery   = document.getElementById('carvery').checked;

    // Format display time
    const [h, m] = time.split(':');
    const hour   = parseInt(h);
    const ampm   = hour >= 12 ? 'pm' : 'am';
    const h12    = hour > 12 ? hour - 12 : hour;
    const dispTime = `${h12}:${m}${ampm}`;

    // Format display date
    const dateObj  = new Date(date + 'T00:00:00');
    const dispDate = dateObj.toLocaleDateString('en-IE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Show confirmation
    document.getElementById('confName').textContent = `${firstName} ${lastName}`;
    document.getElementById('confDetails').innerHTML = `
      <div><strong>Name:</strong> ${firstName} ${lastName}</div>
      <div><strong>Email:</strong> ${email}</div>
      <div><strong>Phone:</strong> ${phone}</div>
      <div><strong>Date:</strong> ${dispDate}</div>
      <div><strong>Time:</strong> ${dispTime}</div>
      <div><strong>Guests:</strong> ${guests}</div>
      ${occasion ? `<div><strong>Occasion:</strong> ${occasion.charAt(0).toUpperCase() + occasion.slice(1)}</div>` : ''}
      ${carvery ? `<div><strong>Carvery Lunch:</strong> Yes ✓</div>` : ''}
    `;

    bookingForm.style.display = 'none';
    document.getElementById('bookingConfirmation').style.display = 'block';
    window.scrollTo({ top: document.querySelector('.booking-form-wrap').offsetTop - 100, behavior: 'smooth' });
  });
}

// ─── SET MIN DATE TO TODAY ────────────────────────────────────
const dateInput = document.getElementById('date');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
}
