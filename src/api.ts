export const API_URL =
  import.meta.env.VITE_API_URL?.toString() || "http://localhost:8000";

export async function analyzeImage(file: File) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`${API_URL}/api/analyze`, {
    method: "POST",
    body: fd,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.detail || "Request failed.");
  }
  return json;
}
