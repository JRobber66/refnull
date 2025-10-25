// src/api/homeAgent.js
import { HOME_AGENT_URL, DEFAULT_TIMEOUT_MS } from '../config.js';

function scrub(obj) {
  const out = { ...obj };
  if (Object.prototype.hasOwnProperty.call(out, 'password')) out.password = out.password ? '***' : '';
  return out;
}

export async function loginPlainDirect({ email, host, port, secure, password }, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const url = `${HOME_AGENT_URL}/api/auth/login-plain`;

  const missing = [];
  for (const k of ['email', 'host', 'port', 'secure', 'password']) {
    if (typeof arguments[0][k] === 'undefined' || arguments[0][k] === null || arguments[0][k] === '') missing.push(k);
  }
  if (missing.length) {
    return { ok: false, error: 'BAD_REQUEST_BODY', missing, diag: { where: 'client', when: new Date().toISOString() } };
  }

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort('timeout'), timeoutMs);

  const body = { email, host, port, secure, password };
  const startDiag = {
    when: new Date().toISOString(),
    url,
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-requested-with': 'xmlhttprequest' },
    body: scrub(body),
    mode: 'cors',
    credentials: 'omit',
    timeoutMs,
  };
  console.info('[frontend→home-agent] START', startDiag);

  try {
    const res = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'content-type': 'application/json',
        'x-requested-with': 'xmlhttprequest',
      },
      body: JSON.stringify(body),
      signal: ac.signal,
      keepalive: true,
    });

    const text = await res.text();
    const ct = res.headers.get('content-type') || '';
    let json;
    if (ct.includes('application/json')) { try { json = JSON.parse(text); } catch {} }

    const endDiag = {
      when: new Date().toISOString(),
      status: res.status,
      ok: res.ok,
      contentType: ct,
      bodyPreview: text.slice(0, 400),
    };
    console.info('[frontend→home-agent] RESPONSE', endDiag);

    if (json) return json;
    return { ok: res.ok, status: res.status, text };
  } catch (err) {
    const diag = {
      when: new Date().toISOString(),
      name: err?.name,
      message: err?.message,
      type: err?.type,
      cause: err?.cause ? { name: err.cause.name, code: err.cause.code, message: err.cause.message } : undefined,
      hint: mixedContentHint(HOME_AGENT_URL),
    };
    console.error('[frontend→home-agent] ERROR', diag);
    return { ok: false, error: 'FETCH_FAILED', diag };
  } finally {
    clearTimeout(t);
  }
}

function mixedContentHint(agentUrl) {
  try {
    const pageHttps = location.protocol === 'https:';
    const agentHttps = agentUrl.startsWith('https://');
    if (pageHttps && !agentHttps) {
      return 'Your page is HTTPS but the home-agent URL is HTTP. Browser will block as mixed content. Serve this page over HTTP for testing or enable HTTPS on home-agent.';
    }
  } catch {}
  return undefined;
}
