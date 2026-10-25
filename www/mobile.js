/* মোবাইল UI: নিচে টুল ডক, ওপরে ছোট বার, ড্রয়ার, আরও-শিট, সিলেকশন মেনু, পিঞ্চ জুম */
(function () {
  'use strict';
  if (!window.MOB) return;

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const mk = (tag, id, html, cls) => {
    const e = document.createElement(tag);
    if (id) e.id = id;
    if (html != null) e.innerHTML = html;
    if (cls) e.className = cls;
    return e;
  };
  const body = document.body;
  const bar = $('#bar');
  const view = $('#view');
  const side = $('#side');
  const CMel = $('#cm');
  const st = $('#st');

  // কীবোর্ড ওঠা-নামায় সঠিক উচ্চতা
  const setVh = () => document.documentElement.style.setProperty('--vh', innerHeight / 100 + 'px');
  setVh();
  addEventListener('resize', setVh);

  /* ---------- ছোট বার্তা ---------- */
  let tt;
  const toast = (m) => { st.textContent = m; };
  new MutationObserver(() => {
    const t = st.textContent.trim();
    if (!t || /^⏳ সেভ|^✓ সেভ হয়েছে/.test(t)) { st.classList.remove('show'); return; }
    st.classList.add('show');
    clearTimeout(tt);
    tt = setTimeout(() => st.classList.remove('show'), 3400);
  }).observe(st, { childList: true, characterData: true, subtree: true });
  body.appendChild(st);

  /* ---------- নোড সংগ্রহ (সরালে ইভেন্ট হ্যান্ডলার থেকে যায়) ---------- */
  const N = {};
  ['open', 'fi', 'tg', 'tools', 'cols', 'cc', 'lw', 'un', 're', 'pn', 'pt', 'zo', 'zi', 'zf', 'bm', 'dk', 'ex', 'gs', 'kbb', 'mw'].forEach((k) => (N[k] = $('#' + k)));
  const hid = mk('div', 'mhid'); hid.style.display = 'none';
  hid.append(N.fi, N.kbb, N.mw);
  body.appendChild(hid);

  const keep = document.createDocumentFragment();
  ['open', 'tg', 'tools', 'cols', 'cc', 'lw', 'un', 're', 'pn', 'pt', 'zo', 'zi', 'zf', 'bm', 'dk', 'ex', 'gs'].forEach((k) => keep.appendChild(N[k]));
  bar.innerHTML = '';

  /* ---------- ওপরের বার ---------- */
  const prev = mk('button', 'mprev', '‹', 'mpg');
  const next = mk('button', 'mnext', '›', 'mpg');
  const more = mk('button', 'mmore', '⋮');
  more.title = 'আরও';
  N.pn.classList.add('mpg'); N.pt.classList.add('mpg');
  bar.append(N.tg, mk('div', 'mtitle', '📄 PDF মার্কার'), prev, N.pn, N.pt, next, mk('span', null, '', 'mspace'), N.un, N.re, more);
  N.un.textContent = '↶'; N.re.textContent = '↷';
  prev.onclick = () => pdf && goPage(cur - 1);
  next.onclick = () => pdf && goPage(cur + 1);

  /* ---------- নিচের ডক ---------- */
  const dock = mk('div', 'mdock');
  dock.appendChild(N.tools);
  body.insertBefore(dock, CMel);
  N.tools.addEventListener('click', (e) => {
    const b = e.target.closest('[data-t]');
    if (!b) return;
    b.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    toast(HINT[b.dataset.t] || '');
  });
  const HINT = {
    sel: '✋ পড়া: স্ক্রল করুন · লেখা চেপে ধরে সিলেক্ট করুন',
    hl: '🖍 হাইলাইট: লেখা সিলেক্ট করে 🖍 চাপুন',
    ul: 'U আন্ডারলাইন: লেখা সিলেক্ট করে U চাপুন',
    st: 'S কাটা দাগ: লেখা সিলেক্ট করে S চাপুন',
    pen: '✏️ কলম: আঙুলে আঁকুন · দুই আঙুলে স্ক্রল/জুম',
    rect: '▭ বক্স: টেনে আঁকুন · দুই আঙুলে স্ক্রল/জুম',
    note: '📝 নোট: যেখানে বসাতে চান সেখানে ট্যাপ করুন',
    text: 'T টেক্সট: যেখানে লিখতে চান সেখানে ট্যাপ করুন',
    eraser: '🧽 ইরেজার: মার্কের ওপর ট্যাপ করুন বা ঘষুন',
    crop: '✂️ এলাকা আঁকুন → Gemini-কে জিজ্ঞেস করুন',
  };

  /* ---------- রং ও মোটা (ভাসমান) ---------- */
  const pill = mk('div', 'mcolor');
  pill.append(N.cols, N.cc, N.lw);
  body.appendChild(pill);
  const DRAW = ['hl', 'ul', 'st', 'pen', 'rect', 'note', 'text'];
  const updPill = () => {
    const t = body.dataset.tool;
    pill.classList.toggle('show', DRAW.includes(t));
    pill.classList.toggle('nolw', !['pen', 'rect'].includes(t));
  };
  new MutationObserver(updPill).observe(body, { attributes: true, attributeFilter: ['data-tool'] });
  updPill();

  /* ---------- আরও-শিট ---------- */
  const back = mk('div', 'mback');
  const sheet = mk('div', 'msheet', '<div class="mgrab"></div><div class="mgrid"></div>');
  const grid = sheet.querySelector('.mgrid');
  const relabel = (el, txt) => { el.textContent = txt; el.title = ''; return el; };
  const lib = mk('button', 'mlib', '🏠 লাইব্রেরি / হোম');
  const find = mk('button', 'mfind', '🔍 খুঁজুন ও তালিকা');
  const pg = mk('button', 'mpage', '🤖 এই পৃষ্ঠা → Gemini');
  grid.append(
    relabel(N.open, '📂 অন্য PDF খুলুন'), find, lib,
    relabel(N.zo, '➖ ছোট করুন'), relabel(N.zi, '➕ বড় করুন'), relabel(N.zf, '↔ প্রস্থে ফিট'),
    relabel(N.bm, '⭐ বুকমার্ক'), relabel(N.dk, '🌙 ডার্ক / লাইট'), pg,
    relabel(N.ex, '⬇ মার্কসহ PDF সেভ'), relabel(N.gs, '⚙ Gemini সেটিংস')
  );
  body.append(back, sheet);

  const openSheet = () => { sheet.classList.add('show'); syncBack(); };
  const closeSheet = () => { sheet.classList.remove('show'); syncBack(); };
  const syncBack = () => back.classList.toggle('show', sheet.classList.contains('show') || side.classList.contains('show'));
  more.onclick = openSheet;
  back.onclick = () => { closeSheet(); side.classList.remove('show'); syncBack(); };
  new MutationObserver(syncBack).observe(side, { attributes: true, attributeFilter: ['class'] });
  // জুম বাদে অন্য টাইলে চাপলে শিট বন্ধ
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || ['zo', 'zi', 'dk', 'bm'].includes(b.id)) return;
    setTimeout(closeSheet, 60);
  });
  lib.onclick = async () => { try { await saveNow(); } catch (e) {} location.reload(); };
  find.onclick = () => { side.classList.add('show'); setTimeout(() => $('#sq').focus(), 250); };
  pg.onclick = () => {
    if (!pdf) return;
    const d = pages[cur - 1];
    ctx = { d, sel: '', pt: null, n: cur };
    CMel.innerHTML = '<div data-a="page"></div>';
    CMel.firstChild.click();
    CMel.classList.add('hide');
  };

  /* ---------- সাইডবার ড্রয়ার ---------- */
  side.insertBefore(mk('div', null, '<b>🔍 খুঁজুন ও তালিকা</b><button id="mdclose">✕</button>', 'mdh'), side.firstChild);
  $('#mdclose').onclick = () => side.classList.remove('show');
  const sq = $('#sq');
  const row = mk('div', null, '', 'msqrow');
  sq.parentNode.insertBefore(row, sq);
  const sbtn = mk('button', null, 'খুঁজুন'); sbtn.classList.add('on');
  row.append(sq, sbtn);
  sq.setAttribute('enterkeyhint', 'search');
  sbtn.onclick = () => sq.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
  side.addEventListener('click', (e) => { if (e.target.closest('[data-p]')) side.classList.remove('show'); });

  /* ---------- স্বাগত পর্দা ---------- */
  const drop = $('#wel .drop');
  if (drop) {
    drop.innerHTML = '<h2>PDF রিডার ও মার্কার</h2><p>নিচের বাটন চেপে ফোন থেকে PDF বেছে নিন।<br>আপনার সব মার্ক নিজে নিজেই সেভ হয়ে যাবে।</p>';
    const big = mk('button', 'bigopen', '📂 PDF খুলুন', 'on bigopen');
    big.onclick = () => $('#fi').click();
    drop.appendChild(big);
  }

  /* ---------- PDF খোলা আছে কিনা ---------- */
  const updPdf = () => body.classList.toggle('nopdf', !view.querySelector('.page'));
  new MutationObserver(updPdf).observe(view, { childList: true });
  updPdf();

  /* ---------- অটো-মার্ক বন্ধ (টাচে হ্যান্ডেল টানার সময় নিজে নিজে মার্ক হয়ে যেত) ---------- */
  const origSelMark = selMark;
  selMark = function (t) { if (typeof t === 'string') return origSelMark(t); };
  // অ্যাপের নিজের রাইট-ক্লিক মেনু মোবাইলে চাই না (নেটিভ সিলেকশনের সাথে ঝগড়া করে)
  view.addEventListener('contextmenu', (e) => e.stopImmediatePropagation(), true);

  /* ---------- সিলেকশন মেনু ---------- */
  const sel = mk('div', 'msel',
    '<div class="mrow">' +
    '<button data-a="hl">🖍</button><button data-a="ul"><u>U</u></button><button data-a="st"><s>S</s></button><span class="mvsep"></span>' +
    '<button data-a="ex">🤖 ব্যাখ্যা</button><button data-a="tr">🌐 অনুবাদ</button><span class="mvsep"></span>' +
    '<button data-a="cp">📋</button><button data-a="gg">🔎</button></div>' +
    '<div class="mrow2"></div>', 'hide');
  sel.querySelector('.mrow2').innerHTML = COLORS.map((c, i) => `<button class="msw" data-i="${i}" style="background:${c}"></button>`).join('');
  body.appendChild(sel);
  sel.addEventListener('mousedown', (e) => e.preventDefault());   // সিলেকশন যেন না ভাঙে

  let saved = null, savedText = '', savedPage = null, savedPt = null, selTimer;
  const hideSel = () => sel.classList.add('hide');
  const syncSw = () => {
    const on = $$('#cols .sw').findIndex((x) => x.classList.contains('on'));
    $$('#msel .msw').forEach((x, i) => x.classList.toggle('on', i === on));
  };
  function placeSel() {
    if (!saved) return;
    let r;
    try { r = saved.getBoundingClientRect(); } catch (e) { return; }
    if (!r || (!r.width && !r.height)) return hideSel();
    sel.classList.remove('hide');
    const w = sel.offsetWidth, h = sel.offsetHeight;
    const topMin = bar.getBoundingClientRect().bottom + 4;
    const botMax = dock.getBoundingClientRect().top - 6;
    let top = r.bottom + 40;                       // নিচে (নেটিভ হ্যান্ডেলের জায়গা ছেড়ে)
    if (top + h > botMax) top = r.top - h - 64;    // জায়গা না থাকলে ওপরে
    top = Math.max(topMin, Math.min(top, botMax - h));
    let left = r.left + r.width / 2 - w / 2;
    left = Math.max(6, Math.min(left, innerWidth - w - 6));
    sel.style.top = top + 'px';
    sel.style.left = left + 'px';
  }
  function updateSel() {
    const s = getSelection();
    if (typeof pdf === 'undefined' || !pdf || !s.rangeCount || s.isCollapsed) { saved = null; return hideSel(); }
    const rg = s.getRangeAt(0);
    let nd = rg.commonAncestorContainer; nd = nd.nodeType === 1 ? nd : nd.parentElement;
    const pgEl = nd && nd.closest && nd.closest('.page');
    const text = s.toString().trim();
    if (!pgEl || !text) { saved = null; return hideSel(); }
    saved = rg.cloneRange(); savedText = text; savedPage = pgEl;
    const pr = pgEl.getBoundingClientRect(), r = rg.getBoundingClientRect();
    savedPt = [(r.left - pr.left) / pr.width, (r.top - pr.top) / pr.height];
    syncSw();
    placeSel();
  }
  document.addEventListener('selectionchange', () => { clearTimeout(selTimer); selTimer = setTimeout(updateSel, 160); });
  let rafSel;
  view.addEventListener('scroll', () => { if (sel.classList.contains('hide')) return; cancelAnimationFrame(rafSel); rafSel = requestAnimationFrame(placeSel); });

  sel.addEventListener('click', (e) => {
    const sw = e.target.closest('.msw');
    if (sw) { const o = $$('#cols .sw')[+sw.dataset.i]; o && o.click(); syncSw(); return; }
    const b = e.target.closest('[data-a]');
    if (!b || !savedPage) return;
    const s = getSelection();
    if ((!s.rangeCount || s.isCollapsed) && saved) { s.removeAllRanges(); s.addRange(saved); }
    ctx = { d: savedPage, sel: savedText, pt: savedPt, n: +savedPage.dataset.n };
    CMel.innerHTML = '<div data-a="' + b.dataset.a + '"></div>';
    CMel.firstChild.click();
    CMel.classList.add('hide');
    hideSel();
    if (['cp'].includes(b.dataset.a)) toast('✓ কপি হয়েছে');
  });

  /* ---------- নোট বসানোর সময় Gemini শিট নামিয়ে দেওয়া ---------- */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.gnp');
    if (!b) return;
    const gd = b.closest('.gd');
    setTimeout(() => {
      if (!body.classList.contains('placing')) return;
      const gb = gd.querySelector('.gb');
      if (!gb.classList.contains('hide')) gd.querySelector('.gmin').click();
      toast('📍 PDF-এ যেখানে নোট বসাতে চান সেখানে ট্যাপ করুন (ব্যাক = বাতিল)');
    }, 60);
  }, true);

  /* ---------- দুই আঙুলে পিঞ্চ জুম + স্ক্রল (আঁকার মোডেও) ---------- */
  let lastPid = 1, lastOv = null, h0 = 0, g = null;
  const dist = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  addEventListener('pointerdown', (e) => {
    lastPid = e.pointerId;
    lastOv = e.target.closest ? e.target.closest('.ov') : null;
  }, true);

  addEventListener('touchstart', (e) => {
    if (typeof pdf === 'undefined' || !pdf) return;
    if (e.touches.length === 1) { h0 = hist.length; return; }
    if (e.touches.length !== 2 || g) return;
    const a = e.touches[0], b = e.touches[1];
    if (!view.contains(a.target) || !view.contains(b.target)) return;

    // চলমান আঁকা বাতিল
    const t0 = tool;
    if (lastOv) {
      try { lastOv.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: lastPid, clientX: a.clientX, clientY: a.clientY })); } catch (er) {}
      if (hist.length > h0) { undo(); redo.length = 0; }
      redrawAll();
      if (tool !== t0) { const tb = $('[data-t=' + t0 + ']'); tb && tb.click(); }
    }
    const rect = view.getBoundingClientRect();
    const mx = (a.clientX + b.clientX) / 2, my = (a.clientY + b.clientY) / 2;
    g = { d0: dist(a, b) || 1, s0: scale, r: 1, mx0: mx, my0: my, mx, my, rect,
          cx: view.scrollLeft + mx - rect.left, cy: view.scrollTop + my - rect.top };
    view.style.transformOrigin = (mx - rect.left) + 'px ' + (my - rect.top) + 'px';
    view.style.willChange = 'transform';
    hideSel();
    if (e.cancelable) e.preventDefault();
  }, { capture: true, passive: false });

  addEventListener('touchmove', (e) => {
    if (!g || e.touches.length < 2) return;
    if (e.cancelable) e.preventDefault();
    const a = e.touches[0], b = e.touches[1];
    const ns = Math.min(4, Math.max(.4, g.s0 * (dist(a, b) / g.d0)));
    g.r = ns / g.s0;
    g.mx = (a.clientX + b.clientX) / 2; g.my = (a.clientY + b.clientY) / 2;
    view.style.transform = 'translate(' + (g.mx - g.mx0) + 'px,' + (g.my - g.my0) + 'px) scale(' + g.r + ')';
  }, { capture: true, passive: false });

  const endPinch = (e) => {
    if (!g || e.touches.length >= 2) return;
    view.style.transform = ''; view.style.transformOrigin = ''; view.style.willChange = '';
    const k = g.r;
    if (Math.abs(k - 1) > .015) zoom(g.s0 * k);
    const kk = Math.abs(k - 1) > .015 ? (scale / g.s0) : 1;
    view.scrollLeft = g.cx * kk - (g.mx - g.rect.left);
    view.scrollTop = g.cy * kk - (g.my - g.rect.top);
    g = null;
  };
  addEventListener('touchend', endPinch, { capture: true });
  addEventListener('touchcancel', endPinch, { capture: true });

  /* ---------- ব্যাক বাটন ---------- */
  window.mobileBack = function () {
    if (sheet.classList.contains('show')) { closeSheet(); return true; }
    if (side.classList.contains('show')) { side.classList.remove('show'); return true; }
    const gds = $$('.gd');
    if (gds.length) { gds[gds.length - 1].querySelector('.gx').click(); return true; }
    if (body.classList.contains('placing')) { cancelPlace(); toast('নোট বসানো বাতিল'); return true; }
    if (!sel.classList.contains('hide')) { getSelection().removeAllRanges(); hideSel(); return true; }
    if (typeof tool !== 'undefined' && tool !== 'sel') { $('[data-t=sel]').click(); return true; }
    return false;
  };
})();
