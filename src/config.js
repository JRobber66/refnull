const B64_AGENT_URL = "aHR0cDovLzk4LjE1Ni43Ny4yMTg6MzEwMDE=";

// If you later add TLS and a domain, you can flip this to an https URL:
// const B64_AGENT_URL = "aHR0cHM6Ly95b3VyLmRvbWFpbi5leGFtcGxlOjMxMDAx";

function b64Decode(str) {
  try { return atob(str); } catch { return ""; }
}

// Export the decoded URL.
// NOTE: if your site is served over HTTPS and this decodes to HTTP,
// browsers will block as mixed content. Either serve this page over HTTP
// for testing, or put HTTPS on your home agent.
export const HOME_AGENT_URL = b64Decode(B64_AGENT_URL);

// Optional: hard timeout (ms) for all calls to your home agent.
export const DEFAULT_TIMEOUT_MS = 12000;
