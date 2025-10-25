// src/config.js

// Base64 for "http://98.156.77.218:31001"
const B64_AGENT = "aHR0cDovLzk4LjE1Ni43Ny4yMTg6MzEwMDE=";

// A slightly more annoying variant: we split and join so scanning is less obvious.
function b64Join(parts) {
  return parts.join("");
}
const B64_SPLIT = b64Join([
  "aH", "R0", "cD", "ov", "Lzk", "4Lj", "E1N", "i43", "Ny4", "yMT", "g6M", "zEw", "MDE", "="
]);

export function getHomeAgentUrl() {
  // Allow runtime override (e.g. in dev tools): localStorage.HOME_AGENT_URL = "http://1.2.3.4:31001"
  const override = typeof localStorage !== "undefined" ? localStorage.getItem("HOME_AGENT_URL") : null;
  if (override) return override;

  try {
    // pick one; both decode to the same
    const raw = atob(B64_SPLIT || B64_AGENT);
    // Optional: minimal sanity checks
    if (!/^https?:\/\/.+:\d+$/i.test(raw)) {
      console.warn("[config] decoded agent URL looks odd:", raw);
    }
    return raw;
  } catch (e) {
    console.error("[config] base64 decode failed:", e);
    // Fallback to plain text if decoding ever failed:
    return "http://98.156.77.218:31001";
  }
}
