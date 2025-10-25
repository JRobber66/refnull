// src/main.js
import { loginPlainDirect, healthCheck } from "./api/homeAgent.js";
import { getHomeAgentUrl } from "./config.js";

const form = document.getElementById("loginForm");
const resultEl = document.getElementById("result");
const diagEl = document.getElementById("diag");

(async () => {
  console.log("[boot] HOME_AGENT_URL =", getHomeAgentUrl());
  const h = await healthCheck();
  console.log("[boot] health", h);
})().catch(console.error);

function show(obj) {
  diagEl.textContent = JSON.stringify(obj, null, 2);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  resultEl.innerHTML = "";
  diagEl.textContent = "";

  const email = document.getElementById("email").value.trim();
  const host = document.getElementById("imapHost").value.trim();
  const port = Number(document.getElementById("imapPort").value);
  const secure = document.getElementById("imapSecure").value === "true";
  const password = document.getElementById("password").value;

  const res = await loginPlainDirect({ email, host, port, secure, password }, { timeoutMs: 15000 });

  // Surface both the high-level result and the verbose guts
  if (res.ok) {
    const payload = res.json || { text: res.text, status: res.status };
    resultEl.innerHTML = `<div class="ok"><b>OK</b> — ${res.status}</div><pre>${escapeHtml(JSON.stringify(payload, null, 2))}</pre>`;
  } else {
    const head = `<div class="err"><b>FAILED</b> — ${res.status || res.error || "unknown"}</div>`;
    const body = `<pre>${escapeHtml(JSON.stringify(res, null, 2))}</pre>`;
    resultEl.innerHTML = head + body;
  }

  // Always dump complete diagnostics to the side panel
  show(res);
});

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
