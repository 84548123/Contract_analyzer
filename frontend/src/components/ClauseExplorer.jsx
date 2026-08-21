import React, { useState } from 'react';
import { Layers, Copy, Check, ExternalLink, Filter, Search } from 'lucide-react';

export default function ClauseExplorer({ clauses = {}, onSelectChunk }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const categories = Object.keys(clauses);

  const filteredEntries = Object.entries(clauses).filter(([label, items]) => {
    if (selectedCategory !== 'ALL' && label !== selectedCategory) return false;
    if (searchQuery === '') return true;
    const matchLabel = label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchText = items.some(item => item.text.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchLabel || matchText;
  });

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search and Category Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Filter clauses by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Categories ({categories.length})
          </button>

          {categories.slice(0, 5).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Clause Cards Grid */}
      {filteredEntries.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-500 text-xs">
          No clauses matched your filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredEntries.map(([label, items]) => {
            const topMatch = items[0];
            const confidencePct = Math.round((topMatch?.confidence || 0) * 100);

            return (
              <div
                key={label}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{label}</h4>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {items.length} matched passage{items.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-28 sm:w-36 text-right">
                      <div className="flex justify-between text-[10px] font-bold mb-1">
                        <span className="text-slate-400">Confidence</span>
                        <span className="text-blue-400">{confidencePct}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full"
                          style={{ width: `${confidencePct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Best snippet */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 relative group">
                  <p className="text-xs text-slate-300 leading-relaxed select-text font-sans">
                    {topMatch.text}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-900 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">
                      Found in Chunk #{topMatch.chunk_index + 1}
                    </span>

                    <button
                      onClick={() => handleCopy(label, topMatch.text)}
                      className="inline-flex items-center space-x-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 transition"
                    >
                      {copiedId === label ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Clause</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
