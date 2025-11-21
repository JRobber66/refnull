// frontend/api.js
import { resolveAgentBase } from './config.js';

function agentUrl(p) {
  const base = resolveAgentBase();
  return new URL(p, base).toString();
}

async function getJSON(path, params) {
  const url = new URL(agentUrl(path));
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const r = await fetch(url, { method: 'GET', credentials: 'include' });
  return { ok: r.ok, status: r.status, json: await r.json().catch(() => ({})) };
}

async function postJSON(path, body) {
  const r = await fetch(agentUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body ?? {}),
  });
  return { ok: r.ok, status: r.status, json: await r.json().catch(() => ({})) };
}

export const api = {
  health: () => getJSON('/health'),
  loginPlain: (b) => postJSON('/api/auth/login-plain', b),
  imapList: (q) => getJSON('/api/imap/list', q),
  imapGet: (q) => getJSON('/api/imap/get', q),
  imapGetRawUrl: (q) => {
    const u = new URL(agentUrl('/api/imap/get-raw'));
    Object.entries(q || {}).forEach(([k, v]) => u.searchParams.set(k, String(v)));
    return u.toString();
  },
  smtpSend: (b) => postJSON('/api/smtp/send', b),
};
