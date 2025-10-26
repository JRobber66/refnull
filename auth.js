import { api } from './api.js';

export async function doLoginOnce({ email, password, host, port, secure, insecureTls }) {
  // No storage of password. One-shot login; httpOnly cookie returned from server.
  const { ok, status, json } = await api.loginPlain({ email, password, host, port, secure, insecureTls });
  if (!ok || !json?.ok) return { ok: false, status, error: json?.error || 'login failed' };
  return { ok: true, profile: { email: json.email, host: json.host, port: json.port, secure: json.secure } };
}
