import React from 'react';
import { FileText, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, Layers, Award } from 'lucide-react';
import RiskGauge from './RiskGauge';

export default function OverviewTab({ summary, riskScore, risks = [], clauses = {}, chunkCount = 0 }) {
  const criticalCount = risks.filter(r => r.severity === 'CRITICAL').length;
  const highCount = risks.filter(r => r.severity === 'HIGH').length;
  const mediumCount = risks.filter(r => r.severity === 'MEDIUM').length;
  const clauseCategoriesCount = Object.keys(clauses).length;

  return (
    <div className="space-y-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-4">
          <RiskGauge score={riskScore?.score || 0} grade={riskScore?.grade || 'A'} size={110} />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Risk Assessment</span>
            <h4 className="text-base font-bold text-white mt-1">Grade {riskScore?.grade || 'A'}</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {criticalCount > 0 ? `${criticalCount} Critical issues` : 'No Critical risks'}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Detected Clauses</span>
            <Layers className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white">{clauseCategoriesCount}</div>
            <p className="text-xs text-slate-400 mt-1">Categories mapped from 30 legal types</p>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-blue-500 h-full rounded-full"
              style={{ width: `${Math.min(100, (clauseCategoriesCount / 15) * 100)}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Document Volume</span>
            <FileText className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white">{chunkCount}</div>
            <p className="text-xs text-slate-400 mt-1">Sliding-window semantic text chunks</p>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-emerald-400 mt-3 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Full text indexed for Extractive QA</span>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center space-x-2 mb-3">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-white">AI Executive Summary (BART-CNN)</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          {summary || "Summary generation in progress..."}
        </p>
      </div>

      {/* Key Risk Highlights */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white">Top Risk Highlights</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {risks.length} total findings
          </span>
        </div>

        {risks.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>No significant contractual risks detected.</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {risks.slice(0, 3).map((r, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start justify-between space-x-4"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      r.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      r.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                      r.severity === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {r.severity}
                    </span>
                    <h4 className="text-xs font-bold text-slate-200">{r.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400">{r.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
