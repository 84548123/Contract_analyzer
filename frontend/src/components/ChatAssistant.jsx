import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare, AlertCircle, Quote, CheckCircle2 } from 'lucide-react';

export default function ChatAssistant({ contractId, onAskQuestion }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I've indexed this contract using RoBERTa extractive QA. Ask me anything about obligations, governing law, payment terms, or liability limits.",
      citations: null,
      confidence: null
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    "What is the governing law and jurisdiction?",
    "Is there a cap on liability and what is the limit?",
    "What are the payment terms and notice periods?",
    "Does this agreement contain non-compete restrictions?",
    "What are the terms for contract termination?"
  ];

  const handleSend = async (questionText) => {
    const q = questionText || input;
    if (!q || !q.trim() || loading) return;

    const userMessage = { role: 'user', content: q };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await onAskQuestion(contractId, q);
      const assistantMessage = {
        role: 'assistant',
        content: response.found ? response.answer : response.answer || "I could not find a confident answer in the document context.",
        citations: response.context || null,
        confidence: response.confidence || null,
        found: response.found
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I encountered an error querying the model. Please check the backend connection.",
          error: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[600px] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Extractive Legal QA Assistant</h4>
            <p className="text-[10px] text-slate-400 font-mono">deepset/roberta-base-squad2</p>
          </div>
        </div>
      </div>

      {/* Suggested prompts */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-950/30 flex items-center space-x-2 overflow-x-auto">
        <span className="text-[10px] uppercase font-bold text-slate-500 flex-shrink-0 flex items-center space-x-1">
          <Sparkles className="h-3 w-3 text-blue-400" />
          <span>Quick:</span>
        </span>
        {sampleQuestions.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSend(sq)}
            disabled={loading}
            className="text-[11px] font-medium text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded-lg whitespace-nowrap transition"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div
              className={`h-7 w-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-blue-400 border border-slate-700'
              }`}
            >
              {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </div>

            <div className={`max-w-[85%] space-y-2`}>
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <p>{msg.content}</p>

                {msg.confidence !== null && msg.confidence !== undefined && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Model Confidence: {Math.round(msg.confidence * 100)}%</span>
                    </span>
                  </div>
                )}
              </div>

              {msg.citations && (
                <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 text-xs space-y-1">
                  <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <Quote className="h-3 w-3 text-blue-400" />
                    <span>Contract Evidence Passage:</span>
                  </div>
                  <p className="text-[11px] text-slate-300 italic font-mono bg-slate-900 p-2 rounded border border-slate-800 select-text">
                    "{msg.citations}"
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start space-x-3">
            <div className="h-7 w-7 rounded-xl bg-slate-800 text-blue-400 flex items-center justify-center flex-shrink-0">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
              <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce" />
              <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] font-medium ml-1">Searching TF-IDF vectors & answering with RoBERTa...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask anything about this contract..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="h-8 w-8 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white flex items-center justify-center transition shadow-md shadow-blue-600/20"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
