/* Capacitor ব্রিজ: ফাইল সেভ, ক্লিপবোর্ড, লিংক, ব্যাক বাটন
   ব্রাউজারেও (Capacitor ছাড়া) আগের মতোই কাজ করবে। */
(function () {
  const C = window.Capacitor;
  const native = !!(C && C.isNativePlatform && C.isNativePlatform());
  const P = (n) => (native && C.Plugins && C.Plugins[n]) || null;

  const toBase64 = (blob) =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result).split(',')[1]);
      r.onerror = () => rej(r.error);
      r.readAsDataURL(blob);
    });

  const note = (m) => {
    const s = document.getElementById('st');
    if (s) { s.textContent = m; setTimeout(() => { if (s.textContent === m) s.textContent = ''; }, 5000); }
  };

  // ফাইল সেভ: প্রথমে Documents/PDF-Marker, না হলে শেয়ার শিট
  window.saveBlob = async function (blob, name) {
    const FS = P('Filesystem'), Share = P('Share');
    if (!FS) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = name; a.click();
      return;
    }
    const data = await toBase64(blob);
    let saved = false;
    try {
      await FS.writeFile({ path: 'PDF-Marker/' + name, data, directory: 'DOCUMENTS', recursive: true });
      saved = true;
      note('✓ সেভ হয়েছে: Documents/PDF-Marker/' + name);
    } catch (e) { /* পুরনো ফোনে অনুমতি না থাকলে নিচে শেয়ারে যাবে */ }
    if (saved && !confirm('Documents/PDF-Marker/' + name + ' এ সেভ হয়েছে।\nএখন শেয়ার/অন্য অ্যাপে পাঠাবেন?')) return;
    try {
      const f = await FS.writeFile({ path: name, data, directory: 'CACHE' });
      if (Share) await Share.share({ title: name, url: f.uri, dialogTitle: 'সেভ / শেয়ার করুন' });
    } catch (e) {
      if (!saved) alert('সেভ করা গেল না: ' + (e.message || e));
    }
  };

  window.copyText = async function (t) {
    const CB = P('Clipboard');
    try {
      if (CB) return await CB.write({ string: String(t) });
      return await navigator.clipboard.writeText(t);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = t; ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (_) {}
      ta.remove();
    }
  };

  window.copyImage = async function (blob) {
    const CB = P('Clipboard');
    if (CB) { // অ্যান্ড্রয়েডে ছবি ক্লিপবোর্ডে যায় না — সেভ করে দিই
      await window.saveBlob(blob, 'pdf-crop-' + Date.now() + '.png');
      return;
    }
    return navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
  };

  window.openUrl = function (u) {
    const B = P('Browser');
    if (B) B.open({ url: u }); else window.open(u, '_blank');
  };

  if (native) {
    const SB = P('StatusBar');
    const syncBar = () => {
      if (!SB) return;
      const dark = document.body.classList.contains('dark');
      try { SB.setBackgroundColor({ color: dark ? '#262a35' : '#ffffff' }); } catch (e) {}
      try { SB.setStyle({ style: dark ? 'DARK' : 'LIGHT' }); } catch (e) {}
      const m = document.querySelector('meta[name=theme-color]');
      if (m) m.content = dark ? '#262a35' : '#ffffff';
    };
    document.addEventListener('DOMContentLoaded', () => {
      if (SB) { try { SB.setOverlaysWebView({ overlay: false }); } catch (e) {} }
      syncBar();
      new MutationObserver(syncBar).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    });
    const App = P('App');
    if (App) {
      App.addListener('backButton', () => {
        const dlg = document.querySelector('.mdl:not(.hide)');
        if (dlg) { dlg.classList.add('hide'); return; }
        const cm = document.getElementById('cm');
        if (cm && !cm.classList.contains('hide')) { cm.classList.add('hide'); return; }
        if (window.mobileBack && window.mobileBack()) return;
        App.minimizeApp();
      });
    }
  }
})();
