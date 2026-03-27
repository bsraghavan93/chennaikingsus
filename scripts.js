// ─── PARTICLE CANVAS ───
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 1.5 + 0.3;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = -Math.random() * 0.4 - 0.1;
    this.opacity = Math.random() * 0.6 + 0.1;
    this.life = 0;
    this.maxLife = Math.random() * 200 + 100;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life++;
    if (this.life > this.maxLife || this.y < 0) this.reset();
  }
  draw() {
    const alpha = this.opacity * (1 - this.life / this.maxLife);
    ctx.fillStyle = `rgba(200, 146, 42, ${alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

for (let i = 0; i < 120; i++) particles.push(new Particle());

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ─── MENU BUILDER ───
function buildMenu() {
  const tabsWrapper   = document.getElementById('menu-tabs');
  const panelsWrapper = document.getElementById('menu-panels');
  if (!tabsWrapper || !panelsWrapper) return;

  MENU_DATA.forEach((category, idx) => {
    // Tab button
    const btn = document.createElement('button');
    btn.className = 'menu-tab' + (idx === 0 ? ' active' : '');
    btn.textContent = category.label;
    btn.addEventListener('click', function () { showMenu(category.id, this); });
    tabsWrapper.appendChild(btn);

    // Panel
    const panel = document.createElement('div');
    panel.id        = 'm-' + category.id;
    panel.className = 'menu-panel' + (idx === 0 ? ' active reveal' : '');

    const card = document.createElement('div');
    card.className = 'menu-card';

    category.sections.forEach(section => {
      // Section title
      const titleEl = document.createElement('div');
      titleEl.className   = 'menu-section-title';
      titleEl.textContent = section.title;
      card.appendChild(titleEl);

      // Optional note
      if (section.note) {
        const noteEl = document.createElement('div');
        noteEl.style.cssText = 'padding:1rem 1.5rem;font-size:0.85rem;color:var(--text-muted);border-bottom:1px solid rgba(200,146,42,0.15);';
        noteEl.textContent = section.note;
        card.appendChild(noteEl);
      }

      // Items
      if (section.cols === 1) {
        section.items.forEach(item => card.appendChild(buildMenuItem(item)));
      } else {
        const row        = document.createElement('div');
        row.className    = 'row g-0';
        const colClass   = section.cols === 3 ? 'col-md-4' : 'col-md-6';
        const perCol     = Math.ceil(section.items.length / section.cols);
        for (let c = 0; c < section.cols; c++) {
          const col = document.createElement('div');
          col.className = colClass;
          section.items.slice(c * perCol, c * perCol + perCol)
            .forEach(item => col.appendChild(buildMenuItem(item)));
          row.appendChild(col);
        }
        card.appendChild(row);
      }
    });

    panel.appendChild(card);
    panelsWrapper.appendChild(panel);
  });
}

function buildMenuItem(item) {
  const isSpecial = item.price === 'Market Price' || item.price === 'Ask for Price';
  const div = document.createElement('div');
  div.className = 'menu-item';
  div.innerHTML = `
    <div class="menu-item-info">
      <div class="menu-item-name">${item.name}</div>
      ${item.desc ? `<div class="menu-item-desc">${item.desc}</div>` : ''}
    </div>
    <div class="menu-item-price"${isSpecial ? ' style="font-size:0.8rem;color:var(--gold);"' : ''}>${item.price}</div>`;
  return div;
}

buildMenu();

// ─── MENU TABS ───
function showMenu(tab, el) {
  document.querySelectorAll('.menu-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('m-' + tab).classList.add('active');
  el.classList.add('active');
}

// ─── DATA-ANIMATE: FLY IN + FLY OUT ───
function applyDelay(el) {
  const d = el.dataset.delay;
  el.style.transitionDelay = d ? d + 'ms' : '0ms';
}

const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const el = entry.target;
    if (entry.isIntersecting) {
      applyDelay(el);
      el.classList.remove('anim-out');
      el.classList.add('anim-in');
    } else {
      // Only fly out if element has already flown in once
      if (el.classList.contains('anim-in')) {
        el.style.transitionDelay = '0ms';
        el.classList.remove('anim-in');
        el.classList.add('anim-out');
      }
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('[data-animate]').forEach(el => {
  animObserver.observe(el);
});

// Legacy .reveal support (for any elements not yet migrated)
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
reveals.forEach(r => revealObserver.observe(r));

// ─── NAVBAR: SHRINK + HIDE/SHOW ───
let lastScroll = 0;
const navbar = document.querySelector('.navbar');
navbar.style.transition = 'transform 0.35s ease, padding 0.35s ease, background 0.35s, box-shadow 0.35s';
window.addEventListener('scroll', () => {
  const current = window.scrollY;
  navbar.classList.toggle('scrolled', current > 60);
  navbar.style.transform = (current > lastScroll && current > 100) ? 'translateY(-100%)' : 'translateY(0)';
  lastScroll = current;
});

// ─── COUNTER ANIMATION ───
function animateCounter(el) {
  const text  = el.textContent.trim();
  const num   = parseFloat(text.replace(/[^0-9.]/g, ''));
  const suffix = text.replace(/[0-9.]/g, '');
  if (isNaN(num)) return;
  const duration = 1600;
  const start    = performance.now();
  const isDecimal = text.includes('.');
  (function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    const current  = isDecimal ? (num * eased).toFixed(1) : Math.floor(num * eased);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(step);
  })(start);
}
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.about-stat-num').forEach(el => counterObserver.observe(el));

// ─── STAGGER CHILDREN ───
const staggerObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stagger-child').forEach((child, i) => {
        setTimeout(() => child.classList.add('visible'), i * 100);
      });
      staggerObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.stagger-wrap').forEach(el => staggerObserver.observe(el));

// ─── PARALLAX ───
const parallaxBg = document.querySelector('.parallax-bg');
window.addEventListener('scroll', () => {
  const banner = document.querySelector('.parallax-banner');
  if (banner) {
    const rect = banner.getBoundingClientRect();
    const offset = rect.top * 0.4;
    parallaxBg.style.transform = `translateY(${offset}px)`;
  }
});
