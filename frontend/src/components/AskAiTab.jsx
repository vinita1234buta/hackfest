import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  ShieldCheck, 
  FileCode, 
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  "What is the main purpose of this project?",
  "How does data flow from user interaction to execution?",
  "Where is authentication or security handled?",
  "Which file should I edit to change the core behavior?",
  "Explain this codebase like I'm a 10-year-old beginner.",
  "How does the frontend communicate with backend/APIs?"
];

export default function AskAiTab({
  result,
  selectedFile,
  onAskAI,
  chatMessages,
  isAsking
}) {
  const [question, setQuestion] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isAsking]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim() && !isAsking) {
      onAskAI(question.trim());
      setQuestion('');
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="rounded-2xl glass-panel border border-white/10 flex flex-col h-[750px] overflow-hidden animate-in fade-in duration-300">
      {/* Header */}
      <div className="px-6 py-4 bg-[#0d1322] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm sm:text-base">
                Ask Gemma 4 About This Repository
              </h3>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Zero-Hallucination
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Grounded exclusively in <span className="font-mono text-purple-300">{result.repo_info?.full_name}</span> files
            </p>
          </div>
        </div>

        {selectedFile && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 font-mono">
            <FileCode className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-400">Focus:</span>
            <span className="truncate max-w-[140px] text-white">{selectedFile}</span>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 py-8">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-white">Ask anything about this project</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Gemma 4 analyzes the repository tree, package declarations, and source files to give honest, beginner-friendly answers.
            </p>

            {/* Suggested Starter Chips */}
            <div className="w-full pt-4 space-y-2 text-left">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center">
                Suggested questions to get started:
              </div>
              <div className="flex flex-col gap-2">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onAskAI(q);
                    }}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-purple-600/20 text-xs text-slate-300 hover:text-white border border-white/5 hover:border-purple-500/30 text-left transition-all"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          chatMessages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-purple-600 text-white rounded-br-xs shadow-lg shadow-purple-600/20 font-medium'
                      : 'glass-panel border border-white/10 text-slate-200 rounded-bl-xs shadow-md'
                  }`}
                >
                  <div className="whitespace-pre-line font-normal">
                    {msg.content}
                  </div>

                  {!isUser && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-mono text-purple-300">Google Gemma 4</span>
                      <button
                        onClick={() => handleCopy(msg.content, idx)}
                        className="hover:text-white flex items-center gap-1 transition-colors"
                        title="Copy answer"
                      >
                        {copiedIndex === idx ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Copied
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Copy className="w-3 h-3" /> Copy
                          </span>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isAsking && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="glass-panel border border-white/10 rounded-2xl p-4 text-xs text-slate-300 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span>Gemma 4 is inspecting repository files and formulating your answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-[#0d1322] border-t border-white/10">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about this repo (e.g. 'How does authentication work?')..."
            disabled={isAsking}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isAsking || !question.trim()}
            className="p-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg shadow-purple-600/20 transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
