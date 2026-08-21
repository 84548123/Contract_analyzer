import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, ShieldCheck, Search, Scale } from 'lucide-react';

export default function FileUpload({ onFileSelected, onSampleSelected, loading, error }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.pdf')) {
        onFileSelected(file);
      } else {
        alert("Please select a PDF file.");
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="text-center mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Powered by RoBERTa + BART Zero-Shot NLP</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          AI Legal Contract Analyzer & Risk Auditor
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Instantly extract legal clauses across 30+ categories, detect missing obligations, assess liability exposure, and query terms with AI.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start space-x-3 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-rose-400" />
          <div>
            <p className="font-semibold">Analysis Failed</p>
            <p className="text-xs text-rose-300/80">{error}</p>
          </div>
        </div>
      )}

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? "border-blue-500 bg-blue-500/5 shadow-2xl shadow-blue-500/10 scale-[1.01]"
            : "border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          onChange={handleChange}
          className="hidden"
          disabled={loading}
        />

        <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-center">
          <UploadCloud className="h-8 w-8 text-blue-400" />
        </div>

        <h3 className="text-lg font-bold text-white mb-1">
          {loading ? "Analyzing Contract..." : "Drop your PDF contract here"}
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Supports NDA, SaaS, MSA, SLA, Licensing, Employment, and Commercial Agreements (PDF)
        </p>

        {loading ? (
          <div className="max-w-xs mx-auto space-y-2">
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 animate-pulse w-3/4 rounded-full" />
            </div>
            <p className="text-[11px] text-blue-400 font-medium">Running sliding-window chunking & BART-MNLI classification...</p>
          </div>
        ) : (
          <button
            type="button"
            className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition"
          >
            <FileText className="h-4 w-4" />
            <span>Browse Files</span>
          </button>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">30+ Clause Types</h4>
            <p className="text-[11px] text-slate-400">Confidentiality, Liability, IP, Termination, Warranties, and more.</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
            <Scale className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Risk Scoring</h4>
            <p className="text-[11px] text-slate-400">Automated legal risk audit with severity tags and mitigation steps.</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Search className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Extractive QA</h4>
            <p className="text-[11px] text-slate-400">RoBERTa engine pinpointing exact answers with contract citations.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
