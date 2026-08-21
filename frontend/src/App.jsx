import React, { useState } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import DocumentViewer from './components/DocumentViewer';
import OverviewTab from './components/OverviewTab';
import RiskDashboard from './components/RiskDashboard';
import ClauseExplorer from './components/ClauseExplorer';
import ChatAssistant from './components/ChatAssistant';
import ExportModal from './components/ExportModal';
import { LayoutDashboard, ShieldAlert, Layers, MessageSquare } from 'lucide-react';

export default function App() {
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);

  const handleFileUpload = async (file) => {
    setLoading(true);
    setError(null);
    setFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server returned error ${response.status}`);
      }

      const data = await response.json();
      setFileData(data);
      setActiveTab('overview');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to analyze contract');
      setFileData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (contractId, question) => {
    const response = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contract_id: contractId, question }),
    });

    if (!response.ok) {
      throw new Error(`QA failed: ${response.statusText}`);
    }

    return await response.json();
  };

  const handleReset = () => {
    setFileData(null);
    setFileName('');
    setError(null);
  };

  const clauseCategoriesCount = fileData?.clauses ? Object.keys(fileData.clauses).length : 0;
  const chunkCount = fileData?.chunk_count || 0;

  const tabs = [
    { id: 'overview', label: 'Executive Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'risks', label: `Risk Matrix (${fileData?.risks?.length || 0})`, icon: <ShieldAlert className="h-4 w-4" /> },
    { id: 'clauses', label: `Clauses (${clauseCategoriesCount})`, icon: <Layers className="h-4 w-4" /> },
    { id: 'qa', label: 'AI Legal Q&A', icon: <MessageSquare className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header
        fileName={fileName}
        chunkCount={chunkCount}
        clauseCount={clauseCategoriesCount}
        onUploadClick={handleReset}
        onExportClick={() => setExportOpen(true)}
        onReset={handleReset}
        loading={loading}
      />

      <main className="flex-1 flex overflow-hidden">
        {!fileData ? (
          <div className="flex-1 overflow-y-auto">
            <FileUpload
              onFileSelected={handleFileUpload}
              loading={loading}
              error={error}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden">
            {/* Left Panel: Document Viewer */}
            <div className="w-full lg:w-5/12 h-1/2 lg:h-full">
              <DocumentViewer
                chunks={fileData.chunks || []}
                clauses={fileData.clauses || {}}
              />
            </div>

            {/* Right Panel: Analysis Tabs */}
            <div className="w-full lg:w-7/12 h-1/2 lg:h-full flex flex-col bg-slate-900/30">
              {/* Tab Navigation */}
              <div className="px-6 pt-4 border-b border-slate-800 bg-slate-950/40 flex items-center space-x-2 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'overview' && (
                  <OverviewTab
                    summary={fileData.summary}
                    riskScore={fileData.risk_score}
                    risks={fileData.risks}
                    clauses={fileData.clauses}
                    chunkCount={chunkCount}
                  />
                )}

                {activeTab === 'risks' && (
                  <RiskDashboard
                    risks={fileData.risks}
                    riskScore={fileData.risk_score}
                  />
                )}

                {activeTab === 'clauses' && (
                  <ClauseExplorer
                    clauses={fileData.clauses}
                  />
                )}

                {activeTab === 'qa' && (
                  <ChatAssistant
                    contractId={fileData.contract_id}
                    onAskQuestion={handleAskQuestion}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        data={fileData}
        fileName={fileName}
      />
    </div>
  );
}
