export const API_URL = "https://web-production-64f21.up.railway.app";

export async function analyzeImage(file: File) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`${API_URL}/api/analyze`, {
    method: "POST",
    body: fd,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.detail || "Request failed");
  }
  return json;
}
