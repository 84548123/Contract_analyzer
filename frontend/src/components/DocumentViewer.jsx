import React, { useState } from 'react';
import { Search, FileText, Bookmark, Copy, Check, ChevronDown, ChevronRight, Hash } from 'lucide-react';

export default function DocumentViewer({ chunks = [], clauses = {}, onClauseClick }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedChunk, setSelectedChunk] = useState(null);

  const fullText = chunks.join('\n\n');

  const filteredChunks = chunks.map((chunk, index) => {
    // Find if any clause belongs to this chunk index
    const matchingClauses = [];
    Object.entries(clauses).forEach(([label, items]) => {
      items.forEach(item => {
        if (item.chunk_index === index) {
          matchingClauses.push({ label, confidence: item.confidence });
        }
      });
    });

    const isMatch = searchTerm === '' || chunk.toLowerCase().includes(searchTerm.toLowerCase());
    return { chunk, index, matchingClauses, isMatch };
  });

  const handleCopyFull = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 border-r border-slate-800">
      <div className="p-4 border-b border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Document Text Explorer</h3>
          </div>
          <button
            onClick={handleCopyFull}
            className="inline-flex items-center space-x-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 transition"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? "Copied" : "Copy Full Text"}</span>
          </button>
        </div>

        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search keywords in contract text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredChunks.filter(c => c.isMatch).length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No text chunks match your search query "{searchTerm}".
          </div>
        ) : (
          filteredChunks
            .filter(c => c.isMatch)
            .map(({ chunk, index, matchingClauses }) => (
              <div
                key={index}
                id={`chunk-${index}`}
                onClick={() => setSelectedChunk(selectedChunk === index ? null : index)}
                className={`p-4 rounded-xl border transition duration-150 cursor-pointer ${
                  matchingClauses.length > 0
                    ? "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                    : "bg-slate-900/30 border-slate-800/50 hover:border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      Chunk #{index + 1}
                    </span>
                    <span className="text-[10px] text-slate-500">{chunk.split(' ').length} words</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {matchingClauses.map((mc, mci) => (
                      <span
                        key={mci}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      >
                        {mc.label} ({Math.round(mc.confidence * 100)}%)
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans select-text">
                  {chunk}
                </p>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
