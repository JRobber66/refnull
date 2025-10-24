const BACKEND = "https://emailserverbackend-production.up.railway.app";
const JWKS_URL = `${BACKEND}/.well-known/jwks.json`;
const LOGIN_URL = `${BACKEND}/api/auth/login-encrypted`;
const POST_LOGIN_PATH = "/mail.html";

const te = new TextEncoder();
const form = document.getElementById("signin-form");
const msg  = document.getElementById("msg");
const btn  = document.getElementById("submit");

function logUI(s) {
  console.log("[auth]", s);
  msg.textContent = s;
}
function b64url(ab) {
  const b = new Uint8Array(ab);
  let s = ""; for (const x of b) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
function uuidv4(){return crypto.randomUUID?.(): 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0,v=c=='x'?r:(r&0x3|0x8);return v.toString(16)})}
function selectEncKey(jwks){
  if (!jwks || !Array.isArray(jwks.keys)) throw new Error("Invalid JWKS shape");
  const k = jwks.keys.find(k => (!k.use || k.use === "enc") && k.kty === "RSA");
  if (!k) throw new Error("No RSA enc key in JWKS");
  return k;
}
async function importRsaKey(jwk){
  const hash = (jwk.alg && jwk.alg.includes("256")) ? "SHA-256" : "SHA-256";
  return crypto.subtle.importKey("jwk", jwk, { name: "RSA-OAEP", hash }, false, ["encrypt"]);
}

// Prefill saved creds (pure convenience; not auth)
try {
  const saved = localStorage.getItem("savedLogin");
  if (saved) {
    const { email, password } = JSON.parse(saved);
    if (email) document.getElementById("email").value = email;
    if (password) document.getElementById("password").value = password;
  }
} catch {}

async function fetchWithDetails(url, init = {}) {
  try {
    const res = await fetch(url, { mode: "cors", credentials: "include", ...init });
    return res;
  } catch (e) {
    // Network/CORS/HTTPS/mixed-content/file:// errors land here
    throw new Error(`Fetch failed for ${url}: ${e.message}`);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";
  btn.disabled = true;

  const email = (document.getElementById("email").value || "").trim();
  const password = document.getElementById("password").value || "";
  if (!email || !password) { logUI("Email and password are required."); btn.disabled = false; return; }

  logUI("Starting login…");
  console.table({
    frontend_origin: window.location.origin,
    backend_origin: new URL(BACKEND).origin,
    jwks_url: JWKS_URL,
    login_url: LOGIN_URL
  });

  try {
    // 1) JWKS
    logUI("Fetching JWKS…");
    const jwksRes = await fetchWithDetails(JWKS_URL, { method: "GET" });
    console.log("[auth] JWKS status", jwksRes.status, Object.fromEntries(jwksRes.headers.entries()));
    if (jwksRes.status === 0) throw new Error("JWKS blocked (CORS/Network).");
    if (!jwksRes.ok) throw new Error(`JWKS HTTP ${jwksRes.status} (path missing or CORS).`);
    const jwks = await jwksRes.json();
    const jwk = selectEncKey(jwks);
    const pubKey = await importRsaKey(jwk);

    // 2) Build + encrypt payload
    const nonce = uuidv4();
    const payload = { email, password, nonce, ts: new Date().toISOString() };
    const plain = te.encode(JSON.stringify(payload));
    const ctBuf = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, pubKey, plain);
    const ciphertext = b64url(ctBuf);

    // 3) POST login
    logUI("Submitting encrypted login…");
    const res = await fetchWithDetails(LOGIN_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ciphertext, kid: jwk.kid, nonce })
    });
    console.log("[auth] login status", res.status, Object.fromEntries(res.headers.entries()));
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Login HTTP ${res.status}: ${text || "no body"}`);
    }

    // 4) Save convenience creds + redirect
    try { localStorage.setItem("savedLogin", JSON.stringify({ email, password })); } catch {}
    logUI("Login success. Redirecting…");
    window.location.href = POST_LOGIN_PATH;
  } catch (err) {
    console.error(err);
    // Show precise, actionable message
    if (String(err.message).includes("TypeError: Failed to fetch")) {
      logUI("Network/CORS error contacting backend.");
    } else {
      logUI(err.message);
    }
  } finally {
    btn.disabled = false;
  }
});
