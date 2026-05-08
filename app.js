/* ============================================================
   app.js — Argos Landing Page Scripts
   ============================================================ */

const CONTACT_EMAIL    = 'miliadisili@yahoo.gr';
const EMAILJS_PUBLIC_KEY   = 'e_A8KgVIdD5tfPad5';
const EMAILJS_SERVICE_ID   = 'service_oc5emyb';
const EMAILJS_TEMPLATE_ID  = 'template_bxb0t7i';

/* ----------------------------------------------------------
   LANGUAGE SWITCHER
---------------------------------------------------------- */
let currentLang = 'en';

function setLang(lang) {
  currentLang = lang;
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.lang-btn[onclick="setLang('${lang}')"]`).classList.add('active');
  document.querySelectorAll('[data-en]').forEach(el => {
    const t = el.getAttribute('data-' + lang);
    if (t) el.innerHTML = t;
  });
}

/* ----------------------------------------------------------
   HAMBURGER / MOBILE MENU
---------------------------------------------------------- */
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  const btn  = document.getElementById('hamburger');
  const open = menu.classList.contains('open');
  if (open) {
    menu.classList.remove('open');
    btn.classList.remove('open');
  } else {
    menu.classList.add('open');
    btn.classList.add('open');
  }
}

function closeMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
}

// Close menu when tapping outside
document.addEventListener('click', e => {
  const menu = document.getElementById('mobileMenu');
  const btn  = document.getElementById('hamburger');
  if (menu.classList.contains('open') && !menu.contains(e.target) && !btn.contains(e.target)) {
    closeMenu();
  }
});

/* ----------------------------------------------------------
   FAQ ACCORDION
---------------------------------------------------------- */
function toggleFaq(el) {
  const item = el.parentElement;
  const open = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!open) item.classList.add('open');
}

/* ----------------------------------------------------------
   CONTACT FORM — EmailJS με fallback σε mailto
---------------------------------------------------------- */
function submitForm() {
  const name    = document.getElementById('f-name').value.trim();
  const email   = document.getElementById('f-email').value.trim();
  const message = document.getElementById('f-message').value.trim();

  if (!name || !email || !message) {
    alert(currentLang === 'el'
      ? 'Παρακαλώ συμπληρώστε όλα τα απαιτούμενα πεδία.'
      : 'Please fill in all required fields.');
    return;
  }

  const subject = document.getElementById('f-subject').value.trim() || 'Argos inquiry';
  const btn = document.querySelector('.btn-submit');

  // Αν το EmailJS είναι ρυθμισμένο, χρησιμοποίησέ το
  if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
    btn.textContent = currentLang === 'el' ? 'Αποστολή...' : 'Sending...';
    btn.disabled = true;

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      from_name:  name,
      from_email: email,
      subject:    subject,
      message:    message,
    }).then(() => {
      document.getElementById('form-success').style.display = 'block';
      btn.textContent = currentLang === 'el' ? 'Αποστολή μηνύματος →' : 'Send message →';
      btn.disabled = false;
      // Clear form
      ['f-name','f-email','f-subject','f-message'].forEach(id => {
        document.getElementById(id).value = '';
      });
    }).catch(err => {
      console.error('EmailJS error:', err);
      btn.textContent = currentLang === 'el' ? 'Αποστολή μηνύματος →' : 'Send message →';
      btn.disabled = false;
      // Fallback σε mailto
      _mailtoFallback(name, email, subject, message);
    });
  } else {
    // Fallback: mailto (ανοίγει email client)
    _mailtoFallback(name, email, subject, message);
  }
}

function _mailtoFallback(name, email, subject, message) {
  const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  document.getElementById('form-success').style.display = 'block';
}

/* ----------------------------------------------------------
   SCROLL ANIMATIONS (fade-up)
---------------------------------------------------------- */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.10 });
document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));

/* ----------------------------------------------------------
   TICKER
---------------------------------------------------------- */
const SYMBOLS = [
  { sym: 'BTC/USDT',  id: 'BTCUSDT'  },
  { sym: 'ETH/USDT',  id: 'ETHUSDT'  },
  { sym: 'SOL/USDT',  id: 'SOLUSDT'  },
  { sym: 'BNB/USDT',  id: 'BNBUSDT'  },
  { sym: 'XRP/USDT',  id: 'XRPUSDT'  },
  { sym: 'ADA/USDT',  id: 'ADAUSDT'  },
  { sym: 'DOGE/USDT', id: 'DOGEUSDT' },
  { sym: 'AVAX/USDT', id: 'AVAXUSDT' },
  { sym: 'LINK/USDT', id: 'LINKUSDT' },
  { sym: 'DOT/USDT',  id: 'DOTUSDT'  },
];
let tickerData = {};

function fmtPrice(p) {
  if (p >= 1000) return p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (p >= 1)    return p.toFixed(4);
  return p.toFixed(5);
}

function buildTicker() {
  const track = document.getElementById('tickerTrack');
  if (!track) return;
  let html = '';
  for (let c = 0; c < 2; c++) {
    SYMBOLS.forEach(s => {
      const d   = tickerData[s.id];
      const px  = d ? fmtPrice(d.price) : '—';
      const chg = d ? d.chg : 0;
      const dir = chg >= 0 ? 'up' : 'down';
      const sgn = chg >= 0 ? '+' : '';
      html += `<div class="ticker-item">
        <span class="ticker-dot ${dir}"></span>
        <span class="ticker-sym">${s.sym}</span>
        <span class="ticker-price">${px}</span>
        <span class="ticker-chg ${dir}">${d ? sgn + chg.toFixed(2) + '%' : ''}</span>
      </div>`;
    });
  }
  track.innerHTML = html;
  // Update mockup live price
  const d = tickerData['BTCUSDT'];
  if (d) {
    const priceEl = document.getElementById('m-price');
    if (priceEl) priceEl.textContent = fmtPrice(d.price);
  }
}

async function fetchTicker() {
  try {
    const syms = SYMBOLS.map(s => `"${s.id}"`).join(',');
    const res  = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=[${syms}]`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    data.forEach(d => {
      tickerData[d.symbol] = {
        price: parseFloat(d.lastPrice),
        chg:   parseFloat(d.priceChangePercent)
      };
    });
    buildTicker();
  } catch (e) {
    if (!Object.keys(tickerData).length) buildTicker();
  }
}

buildTicker();
fetchTicker();
setInterval(fetchTicker, 15000);

/* ----------------------------------------------------------
   HERO LIVE CHART (mobile)
---------------------------------------------------------- */
let hlcPrices = [];

function drawHlcChart() {
  const canvas = document.getElementById('hlcCanvas');
  if (!canvas) return;
  const W = canvas.offsetWidth;
  const H = 70;
  canvas.width  = W * window.devicePixelRatio;
  canvas.height = H * window.devicePixelRatio;
  const ctx = canvas.getContext('2d');
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  if (hlcPrices.length < 2) return;
  const prices = hlcPrices;
  const mn = Math.min(...prices) * 0.9998;
  const mx = Math.max(...prices) * 1.0002;
  const pad = { t: 8, b: 8, l: 4, r: 4 };
  const cw = W - pad.l - pad.r;
  const ch = H - pad.t - pad.b;

  const px = (i) => pad.l + (i / (prices.length - 1)) * cw;
  const py = (v) => pad.t + (1 - (v - mn) / (mx - mn)) * ch;

  // Gradient fill
  const grad = ctx.createLinearGradient(0, pad.t, 0, H);
  grad.addColorStop(0, 'rgba(42,79,255,0.25)');
  grad.addColorStop(1, 'rgba(42,79,255,0)');
  ctx.beginPath();
  ctx.moveTo(px(0), py(prices[0]));
  prices.forEach((p, i) => { if (i > 0) ctx.lineTo(px(i), py(p)); });
  ctx.lineTo(px(prices.length - 1), H);
  ctx.lineTo(px(0), H);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.moveTo(px(0), py(prices[0]));
  prices.forEach((p, i) => { if (i > 0) ctx.lineTo(px(i), py(p)); });
  ctx.strokeStyle = '#2A4FFF';
  ctx.lineWidth   = 1.5;
  ctx.lineJoin    = 'round';
  ctx.stroke();

  // Last price dot
  const lx = px(prices.length - 1);
  const ly = py(prices[prices.length - 1]);
  ctx.beginPath();
  ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = prices[prices.length - 1] >= prices[prices.length - 2] ? '#17C97A' : '#FF4D4D';
  ctx.fill();
}

async function fetchHlcData() {
  try {
    const res = await fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=60');
    if (!res.ok) throw new Error();
    const data = await res.json();
    hlcPrices = data.map(c => parseFloat(c[4])); // close prices

    const last    = hlcPrices[hlcPrices.length - 1];
    const first   = hlcPrices[0];
    const chgPct  = ((last - first) / first * 100);

    // Price display
    const priceEl = document.getElementById('hlc-price');
    const chgEl   = document.getElementById('hlc-chg');
    if (priceEl) priceEl.textContent = last.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (chgEl) {
      chgEl.textContent = (chgPct >= 0 ? '+' : '') + chgPct.toFixed(2) + '%';
      chgEl.className   = 'hlc-chg ' + (chgPct >= 0 ? 'up' : 'down');
    }

    // RSI estimate
    const rsiEl = document.getElementById('hlc-rsi');
    if (rsiEl) {
      const gains  = hlcPrices.slice(-14).filter((p, i, a) => i > 0 && p > a[i - 1]).length;
      const rsiEst = Math.round(40 + gains * 3.5);
      rsiEl.textContent = rsiEst;
      rsiEl.className   = 'hlc-stat-v ' + (rsiEst < 45 ? 'cv-g' : rsiEst > 60 ? 'sv-r' : 'cv-b');
    }

    // Signal
    const sigEl = document.getElementById('hlc-sig');
    if (sigEl) {
      if (chgPct > 0.3)       { sigEl.textContent = 'LONG';  sigEl.style.color = '#17C97A'; }
      else if (chgPct < -0.3) { sigEl.textContent = 'SHORT'; sigEl.style.color = '#FF4D4D'; }
      else                    { sigEl.textContent = '—';     sigEl.style.color = ''; }
    }

    drawHlcChart();
  } catch (e) { /* silent fail */ }
}

fetchHlcData();
setInterval(fetchHlcData, 30000);
window.addEventListener('resize', drawHlcChart);