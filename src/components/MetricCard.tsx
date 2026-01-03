import React from "react";

export function MetricCard(props: {
  title: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl shadow-black/30">
      <div className="text-sm text-slate-300">{props.title}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{props.value}</div>
      {props.hint ? (
        <div className="mt-2 text-xs text-slate-400 leading-relaxed">{props.hint}</div>
      ) : null}
    </div>
  );
}

export function ScoreBar(props: { label: string; score: number }) {
  const pct = Math.max(0, Math.min(100, props.score));
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-200">{props.label}</div>
        <div className="text-sm font-semibold">{pct.toFixed(1)}</div>
      </div>
      <div className="mt-3 h-2 w-full rounded-full bg-white/10">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-indigo-400 via-emerald-400 to-rose-400"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
