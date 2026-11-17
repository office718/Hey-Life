// Replaces the Claude artifact runtime (window.claude) with this server's API,
// so the dashboard file runs unchanged. db -> /api/data, sample -> /api/ai, live updates -> /api/stream.
(function () {
  "use strict";
  const H = { "content-type": "application/json", "x-hey-client": "1" };
  const err = (code, message) => Object.assign(new Error(message || code), { code });

  async function call(method, url, body, signal) {
    let r;
    try { r = await fetch(url, { method, headers: H, credentials: "same-origin", body: body === undefined ? undefined : JSON.stringify(body), signal }); }
    catch (e) { throw err(e && e.name === "AbortError" ? "cancelled" : "unavailable"); }
    if (r.status === 401) { location.href = "/login"; throw err("session_expired"); }
    const out = await r.json().catch(() => ({}));
    if (!r.ok) throw err(out.code || "unavailable", out.message);
    return out;
  }

  // ---------- db ----------
  const listeners = {};   // collection -> Set of {cb, onErr}
  const cache = {};       // collection -> last docs
  const loading = {};
  const makeSnap = docs => ({ docs: docs.map(d => { const { id, ...rest } = d; return { id, data: () => rest }; }), size: docs.length, empty: !docs.length });
  async function refresh(col) {
    if (loading[col]) { loading[col].again = true; return loading[col].p; }
    const st = loading[col] = { again: false };
    st.p = (async () => {
      do {
        st.again = false;
        try {
          const docs = await call("GET", "/api/data/" + encodeURIComponent(col));
          cache[col] = docs;
          for (const l of listeners[col] || []) { try { l.cb(makeSnap(docs)); } catch (e) { console.error(e); } }
        } catch (e) { for (const l of listeners[col] || []) l.onErr && l.onErr(e); }
      } while (st.again);
      delete loading[col];
    })();
    return st.p;
  }
  const rid = () => { const a = "abcdefghijklmnopqrstuvwxyz0123456789", b = crypto.getRandomValues(new Uint8Array(20)); return Array.from(b, x => a[x % 36]).join(""); };

  function docRef(col, id) {
    const url = "/api/data/" + encodeURIComponent(col) + "/" + encodeURIComponent(id);
    return {
      id, path: col + "/" + id,
      async get() { const d = (cache[col] || (await refresh(col), cache[col]) || []).find(x => x.id === id); return { id, exists: !!d, data: () => d ? (({ id: _i, ...r }) => r)(d) : undefined }; },
      async set(data) { await call("PUT", url, { data }); refresh(col); },
      async update(data) {
        try { await call("PATCH", url, { data }); }
        catch (e) { if (e.code === "not_found") throw err("not_found"); throw e; }
        refresh(col);
      },
      async delete() { await call("DELETE", url).catch(e => { if (e.code !== "not_found") throw e; }); refresh(col); },
    };
  }
  function collection(col) {
    return {
      doc(id) { return docRef(col, id || rid()); },
      async add(data) { const id = rid(); await call("POST", "/api/data/" + encodeURIComponent(col), { id, data }); refresh(col); return docRef(col, id); },
      onSnapshot(cb, onErr) {
        const l = { cb, onErr }; (listeners[col] ||= new Set()).add(l);
        if (cache[col]) setTimeout(() => cb(makeSnap(cache[col])), 0); else refresh(col);
        return () => listeners[col].delete(l);
      },
    };
  }
  const db = { collection, doc(path) { const [c, ...rest] = String(path).split("/"); return docRef(c, rest.join("/")); } };

  // Live updates: the server says which collection changed; we reload it.
  let es, backoff = 1000;
  function connect() {
    es = new EventSource("/api/stream");
    es.addEventListener("change", e => { if (listeners[e.data] && listeners[e.data].size) refresh(e.data); });
    es.onopen = () => { if (backoff > 1000) Object.keys(listeners).forEach(refresh); backoff = 1000; };
    es.onerror = () => { es.close(); setTimeout(connect, backoff); backoff = Math.min(backoff * 2, 30000); };
  }
  connect();
  document.addEventListener("visibilitychange", () => { if (!document.hidden) Object.keys(listeners).forEach(refresh); });

  // ---------- sample (Claude through our server) ----------
  async function ai(prompt, json, opts) {
    const o = opts || {};
    if (o.signal && o.signal.aborted) throw err("cancelled");
    const out = await call("POST", "/api/ai", { prompt: String(prompt), json }, o.signal);
    return out;
  }
  async function sample(prompt, opts) {
    const out = await ai(prompt, false, opts);
    if (opts && typeof opts.onText === "function") { try { opts.onText({ text: out.text }); } catch (e) {} }
    return { text: out.text, truncated: !!out.truncated };
  }
  sample.json = async (prompt, opts) => (await ai(prompt, true, opts)).json;

  // ---------- user ----------
  const user = { can: async () => true, info: async () => window.__HEY || {} };

  const caps = { db, sample, user };
  window.claude = { use: async name => caps[name] || null };

  // ---------- installable app + push ----------
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});

  window.heyPush = async function enable() {
    const de = !window.__HEY || window.__HEY.lang !== "en";
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert(de ? "Auf dem iPhone: zuerst „Zum Home-Bildschirm“ hinzufügen und die App von dort öffnen." : "On iPhone: add the app to the home screen first and open it from there.");
      return false;
    }
    const { key } = await call("GET", "/api/push/key");
    if (!key) return false;
    if ((await Notification.requestPermission()) !== "granted") return false;
    const reg = await navigator.serviceWorker.ready;
    const b64 = key.replace(/-/g, "+").replace(/_/g, "/"), raw = atob(b64 + "=".repeat((4 - b64.length % 4) % 4));
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: Uint8Array.from(raw, c => c.charCodeAt(0)) });
    await call("POST", "/api/push/subscribe", sub.toJSON());
    return true;
  };

  // A small floating button, shown until notifications are on.
  async function pushButton() {
    if (!("Notification" in window) || Notification.permission === "denied") return;
    try {
      const reg = await navigator.serviceWorker.ready;
      if (Notification.permission === "granted" && await reg.pushManager.getSubscription()) return;
      const { key } = await call("GET", "/api/push/key"); if (!key) return;
    } catch (e) { return; }
    if (localStorage.getItem("hey.pushLater") > Date.now()) return;
    const de = !window.__HEY || window.__HEY.lang !== "en";
    const b = document.createElement("div");
    b.setAttribute("style", "position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:50;background:#0F353A;color:#fff;border-radius:999px;padding:8px 8px 8px 16px;display:flex;gap:8px;align-items:center;font:14px Figtree,system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.25);max-width:calc(100% - 32px)");
    b.innerHTML = `<span>${de ? "Benachrichtigungen aktivieren?" : "Turn on notifications?"}</span>`;
    const yes = document.createElement("button"), no = document.createElement("button");
    yes.textContent = de ? "Ja" : "Yes"; no.textContent = de ? "Später" : "Later";
    for (const x of [yes, no]) x.setAttribute("style", "border:0;border-radius:999px;padding:6px 12px;font:inherit;cursor:pointer;" + (x === yes ? "background:#F5B301;color:#0F353A" : "background:transparent;color:#fff"));
    yes.onclick = async () => { b.remove(); try { await window.heyPush(); } catch (e) { console.error(e); } };
    no.onclick = () => { b.remove(); try { localStorage.setItem("hey.pushLater", String(Date.now() + 7 * 864e5)); } catch (e) {} };
    b.append(yes, no); document.body.appendChild(b);
  }
  window.addEventListener("load", () => setTimeout(pushButton, 4000));
})();
