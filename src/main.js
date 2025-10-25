// src/main.js
import { loginPlainDirect } from './api/homeAgent.js';
import { HOME_AGENT_URL } from './config.js';

let diagEl = null;
export function setDiagTarget(el) { diagEl = el; }

function logDiag(obj) {
  try {
    if (diagEl) {
      const now = new Date().toISOString();
      diagEl.textContent = `${now}\n${JSON.stringify(obj, null, 2)}\n\n` + diagEl.textContent;
    }
  } catch {}
}

function showTopLine(line) {
  logDiag({ info: line });
}

function bindForm() {
  const f = document.getElementById('loginForm');
  f?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email    = document.getElementById('email').value.trim();
    const host     = document.getElementById('imapHost').value.trim();
    const port     = Number(document.getElementById('imapPort').value.trim());
    const secure   = document.getElementById('imapSecure').checked;
    const password = document.getElementById('password').value;

    showTopLine(`Attempting login via ${HOME_AGENT_URL}/api/auth/login-plain`);

    const result = await loginPlainDirect({ email, host, port, secure, password });
    logDiag({ result });

    if (result?.ok) {
      alert('Login OK\n\n' + JSON.stringify(result, null, 2));
    } else {
      alert('Login FAILED\n\n' + JSON.stringify(result, null, 2));
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    logDiag({ page: 'loaded', homeAgentUrl: HOME_AGENT_URL, pageProtocol: location.protocol });
  }, 0);
  bindForm();
});
