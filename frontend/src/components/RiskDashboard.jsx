import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, AlertCircle, Info, CheckCircle2, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import RiskGauge from './RiskGauge';

export default function RiskDashboard({ risks = [], riskScore }) {
  const [filter, setFilter] = useState('ALL');
  const [expandedIndex, setExpandedIndex] = useState(null);

  const filteredRisks = risks.filter(r => {
    if (filter === 'ALL') return true;
    return r.severity === filter;
  });

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          icon: <AlertCircle className="h-3.5 w-3.5" />,
          style: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          dot: 'bg-rose-500'
        };
      case 'HIGH':
        return {
          icon: <AlertTriangle className="h-3.5 w-3.5" />,
          style: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
          dot: 'bg-orange-500'
        };
      case 'MEDIUM':
        return {
          icon: <Info className="h-3.5 w-3.5" />,
          style: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-500'
        };
      default:
        return {
          icon: <CheckCircle2 className="h-3.5 w-3.5" />,
          style: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          dot: 'bg-blue-500'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Score Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
          <RiskGauge score={riskScore?.score || 0} grade={riskScore?.grade || 'A'} size={130} />
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold text-white">Contract Risk Profile</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              {riskScore?.summary || "Comprehensive legal and operational risk score calculated across standard commercial criteria."}
            </p>
          </div>
        </div>

        {/* Severity counts pill grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
          {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => {
            const count = risks.filter(r => r.severity === sev).length;
            const badge = getSeverityBadge(sev);
            return (
              <button
                key={sev}
                onClick={() => setFilter(filter === sev ? 'ALL' : sev)}
                className={`p-3 rounded-xl border text-center transition ${
                  filter === sev
                    ? `${badge.style} border-current shadow-lg shadow-black/40`
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="text-base font-extrabold">{count}</div>
                <div className="text-[10px] font-semibold tracking-wider uppercase opacity-80">{sev}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center space-x-2">
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
          <button
            key={sev}
            onClick={() => setFilter(sev)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
              filter === sev
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {sev} ({sev === 'ALL' ? risks.length : risks.filter(r => r.severity === sev).length})
          </button>
        ))}
      </div>

      {/* Risk Items List */}
      <div className="space-y-3">
        {filteredRisks.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-500 text-xs">
            No risks found matching category "{filter}".
          </div>
        ) : (
          filteredRisks.map((risk, index) => {
            const isExpanded = expandedIndex === index;
            const badge = getSeverityBadge(risk.severity);

            return (
              <div
                key={index}
                className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden transition"
              >
                <div
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40"
                >
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center space-x-1 text-[10px] font-bold uppercase px-2.5 py-1 rounded-md border ${badge.style}`}>
                      {badge.icon}
                      <span>{risk.severity}</span>
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{risk.title}</h4>
                      <span className="text-[11px] text-slate-400 font-mono">{risk.category}</span>
                    </div>
                  </div>

                  <button className="text-slate-500 hover:text-slate-300">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-800/60 bg-slate-950/40 space-y-3 text-xs">
                    <div>
                      <span className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider">Analysis:</span>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">{risk.description}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-blue-300 flex items-start space-x-2.5">
                      <Lightbulb className="h-4 w-4 flex-shrink-0 text-blue-400 mt-0.5" />
                      <div>
                        <span className="font-bold text-blue-200">Recommended Action:</span>
                        <p className="mt-0.5 text-blue-300/90 leading-relaxed">{risk.recommendation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
