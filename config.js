// frontend/config.js
const ALLOWLIST = new Set([
  'https://jrobber66.github.io',
  'https://agent.refnull.net', // agent origin itself (if you ever host UI there)
]);
// Your agent base (MUST be HTTPS in production).
const AGENT_BASE = 'https://agent.refnull.net';

export function resolveAgentBase() {
  const origin = new URL(AGENT_BASE).origin;
  if (!origin.startsWith('https://')) throw new Error('Agent must be HTTPS');
  if (!ALLOWLIST.has(origin)) throw new Error('Agent origin not allowed');
  return origin;
}
