import React, { useState } from 'react';
import { X, Download, Copy, Check, FileText, CheckCircle2 } from 'lucide-react';

export default function ExportModal({ isOpen, onClose, data, fileName }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !data) return null;

  const generateMarkdown = () => {
    let md = `# Contract Audit Report: ${fileName || 'Contract'}\n\n`;
    md += `**Date:** ${new Date().toLocaleDateString()}\n`;
    md += `**Risk Score:** ${data.risk_score?.score || 0}/100 (Grade: ${data.risk_score?.grade || 'A'})\n\n`;
    md += `## 1. Executive Summary\n${data.summary || 'N/A'}\n\n`;
    
    md += `## 2. Identified Contract Risks\n`;
    if (data.risks && data.risks.length > 0) {
      data.risks.forEach((r, idx) => {
        md += `### ${idx + 1}. [${r.severity}] ${r.title}\n`;
        md += `- **Analysis:** ${r.description}\n`;
        md += `- **Recommendation:** ${r.recommendation}\n\n`;
      });
    } else {
      md += `No significant risks identified.\n\n`;
    }

    md += `## 3. Extracted Legal Clauses\n`;
    if (data.clauses) {
      Object.entries(data.clauses).forEach(([label, items]) => {
        md += `### ${label} (${Math.round((items[0]?.confidence || 0) * 100)}% Confidence)\n`;
        md += `> ${items[0]?.text || ''}\n\n`;
      });
    }

    return md;
  };

  const markdownText = generateMarkdown();

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract_audit_${(fileName || 'report').replace('.pdf', '')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Export Audit Report</h3>
              <p className="text-xs text-slate-400">Download formatted Markdown report</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 font-mono text-[11px] text-slate-300 bg-slate-950 select-text leading-relaxed">
          <pre className="whitespace-pre-wrap">{markdownText}</pre>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-end space-x-3">
          <button
            onClick={handleCopy}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied" : "Copy Markdown"}</span>
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download .MD Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
