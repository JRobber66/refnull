import React, { useState } from "react";
import { analyzeImage } from "./api";

type Subratings = Record<string, number>;

type Result = {
  overall_rating: number;
  subratings: Subratings;
};

const LABELS: Record<string, string> = {
  face_structure: "Face Structure",
  symmetry: "Symmetry",
  facial_ratio_balance: "Facial Ratios",
  jawline_definition: "Jawline",
  eye_spacing: "Eye Spacing",
  mouth_proportion: "Mouth Proportion",
  nose_proportion: "Nose Proportion",
  skin_clarity: "Skin Clarity",
  skin_smoothness: "Skin Smoothness",
  texture_uniformity: "Texture Uniformity",
  emotion: "Emotion",
  expressiveness: "Expressiveness",
  neutrality: "Neutrality",
};

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<Result | null>(null);

  const onPick = (f: File | null) => {
    setFile(f);
    setData(null);
    setError("");
    if (!f) {
      setPreview("");
      return;
    }
    setPreview(URL.createObjectURL(f));
  };

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    setData(null);
    try {
      const res = await analyzeImage(file);
      setData(res);
    } catch (e: any) {
      setError(e?.message || "Analysis failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-4xl font-bold tracking-tight">Face Rater</h1>
        <p className="mt-2 text-slate-400">
          Upload a photo. Get a number. Over-analyzed on purpose.
        </p>

        {/* Upload */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <input
            type="file"
            accept="image/*"
            id="file"
            className="hidden"
            onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          />

          {!preview ? (
            <label
              htmlFor="file"
              className="flex h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 text-slate-400 hover:border-white/30"
            >
              <div>Click to upload a photo</div>
              <div className="mt-2 text-xs">Front-facing recommended</div>
            </label>
          ) : (
            <div className="space-y-4">
              <img
                src={preview}
                className="mx-auto max-h-[360px] rounded-2xl object-contain ring-1 ring-white/10"
              />
              <div className="flex gap-3">
                <button
                  onClick={run}
                  disabled={busy}
                  className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 disabled:opacity-40"
                >
                  {busy ? "Analyzing…" : "Rate"}
                </button>
                <button
                  onClick={() => onPick(null)}
                  className="rounded-xl border border-white/15 px-5 py-3 text-sm hover:bg-white/10"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {error && <div className="mt-4 text-sm text-rose-400">{error}</div>}
        </div>

        {/* Results */}
        {data && (
          <div className="mt-10 space-y-8">
            {/* Overall score */}
            <div className="rounded-3xl bg-gradient-to-br from-indigo-500 via-emerald-400 to-rose-400 p-[2px]">
              <div className="rounded-3xl bg-slate-950 p-8 text-center">
                <div className="text-sm text-slate-400">Overall Rating</div>
                <div className="mt-2 text-6xl font-bold tracking-tight">
                  {data.overall_rating}
                </div>
              </div>
            </div>

            {/* Subratings grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Object.entries(data.subratings).map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center"
                >
                  <div className="text-xs text-slate-400">
                    {LABELS[key] ?? key.replace(/_/g, " ")}
                  </div>
                  <div className="mt-1 text-2xl font-semibold">
                    {value.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="mt-14 text-xs text-slate-500">
          Geometry-based heuristics. Entertainment only.
        </footer>
      </div>
    </div>
  );
}
