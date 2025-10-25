// src/api/homeAgent.js
import { getHomeAgentUrl } from "../config.js";

function redact(obj) {
  if (!obj) return obj;
  const c = { ...obj };
  if (typeof c.password === "string") c.password = "***";
  return c;
}

async function request(url, options, { timeoutMs = 12000 } = {}) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort("timeout"), timeoutMs);
  const started = Date.now();

  const out = {
    when: new Date().toISOString(),
    url,
    method: options?.method || "GET",
    headers: options?.headers || {},
    body: options?.body ? (() => {
      try { return JSON.parse(options.body); } catch { return String(options.body).slice(0, 400); }
    })() : undefined,
    timeoutMs
  };
  console.info("[fetch] →", redact(out));

  try {
    const res = await fetch(url, { ...options, signal: ac.signal, mode: "cors", credentials: "omit", keepalive: true });
    const text = await res.text();
    const ct = res.headers.get("content-type") || "";
    let json = null;
    if (ct.includes("application/json")) {
      try { json = JSON.parse(text); } catch { /* ignore */ }
    }
    const elapsed = Date.now() - started;
    const info = { status: res.status, ok: res.ok, elapsedMs: elapsed, ct, preview: text.slice(0, 400) };
    console.info("[fetch] ←", info);

    return { ok: res.ok, status: res.status, json, text, info };
  } catch (err) {
    const elapsed = Date.now() - started;
    const diag = {
      name: err?.name,
      message: err?.message,
      type: err?.type,
      cause: err?.cause ? { name: err.cause.name, code: err.cause.code, message: err.cause.message } : undefined,
      elapsedMs: elapsed
    };
    console.error("[fetch] × error", diag);
    return { ok: false, error: "FETCH_FAILED", diag };
  } finally {
    clearTimeout(t);
  }
}

export async function healthCheck() {
  const BASE = getHomeAgentUrl();
  return request(`${BASE}/health`, { method: "GET", headers: { "x-requested-with": "xmlhttprequest" } }, { timeoutMs: 6000 });
}

export async function loginPlainDirect({ email, host, port, secure, password }, { timeoutMs = 12000 } = {}) {
  const BASE = getHomeAgentUrl();
  const missing = [];
  for (const k of ["email", "host", "port", "secure", "password"]) {
    if (typeof arguments[0][k] === "undefined" || arguments[0][k] === null || arguments[0][k] === "") missing.push(k);
  }
  if (missing.length) {
    const diag = { when: new Date().toISOString(), where: "client", missing };
    console.warn("[loginPlainDirect] missing fields:", diag);
    return { ok: false, error: "BAD_REQUEST_BODY", diag };
  }

  // optional: quick health ping for visibility (does not block the main call)
  healthCheck().then(h => console.log("[health]", h.status, h.json || h.text || h.error)).catch(()=>{});

  return request(
    `${BASE}/api/auth/login-plain`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-requested-with": "xmlhttprequest"
      },
      body: JSON.stringify({ email, host, port, secure, password })
    },
    { timeoutMs }
  );
}
