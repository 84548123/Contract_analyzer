import React from 'react';
import { ShieldAlert, FileText, Download, UploadCloud, RefreshCw, Cpu, Layers } from 'lucide-react';

export default function Header({ 
  fileName, 
  chunkCount, 
  clauseCount, 
  onUploadClick, 
  onExportClick,
  onReset,
  loading 
}) {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <ShieldAlert className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold text-white tracking-tight">ContractIQ</h1>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              AI Legal Suite
            </span>
          </div>
          <p className="text-xs text-slate-400">Zero-Shot Clause Extraction & Risk Intelligence</p>
        </div>
      </div>

      {fileName && (
        <div className="hidden md:flex items-center space-x-4 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-300">
            <FileText className="h-3.5 w-3.5 text-blue-400" />
            <span className="truncate max-w-[200px]">{fileName}</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Layers className="h-3.5 w-3.5 text-indigo-400" />
            <span>{chunkCount} Chunks</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Cpu className="h-3.5 w-3.5 text-emerald-400" />
            <span>{clauseCount} Clauses</span>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2.5">
        {fileName && (
          <>
            <button
              onClick={onExportClick}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Audit</span>
            </button>
            <button
              onClick={onUploadClick}
              disabled={loading}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Analyze Another</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
