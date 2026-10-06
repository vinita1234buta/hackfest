import React, { useState, useEffect } from 'react';
import { Search, Sparkles, ArrowRight, ShieldCheck, Code, Layers, MessageSquare, Terminal, Waves, Zap, Radio } from 'lucide-react';
import MicroSlats from './MicroSlats';

const ANALYSIS_STAGES = [
  "Connecting to GitHub API...",
  "Scanning repository tree & filtering noise...",
  "Reading prioritized source & configuration files...",
  "Synthesizing architecture & code flow...",
  "Consulting Google Gemma 4 AI engine...",
  "Crafting beginner-friendly explanation...",
  "Finalizing interactive dashboard..."
];

const PRESETS = [
  { id: 'swell', label: 'Swell', icon: Waves },
  { id: 'tide', label: 'Tide', icon: Waves },
  { id: 'storm', label: 'Storm', icon: Zap },
  { id: 'signal', label: 'Signal', icon: Radio },
];

export default function Hero({ onAnalyze, isLoading, error, demoRepos, onSelectDemo }) {
  const [url, setUrl] = useState('');
  const [stageIndex, setStageIndex] = useState(0);
  const [preset, setPreset] = useState('swell');

  useEffect(() => {
    if (!isLoading) {
      setStageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % ANALYSIS_STAGES.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url.trim());
    }
  };

  return (
    <div className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
      {/* MicroSlats WebGL Interactive Fluid Background */}
      <div className="absolute inset-0 -top-12 -bottom-24 overflow-hidden -z-10 rounded-3xl opacity-75">
        <MicroSlats
          preset={preset}
          color="#a855f7"
          glintColor="#38bdf8"
          backgroundColor="#00000000"
          slatWidth={9}
          slatHeight={24}
          gap={3.5}
          roundness={0.75}
          scale={1.3}
          speed={0.7}
          interactive={true}
          cursorStrength={1.4}
          cursorSize={45}
          swirl={0.5}
          trail={1.6}
          lean={0.35}
          intro={true}
        />
        {/* Soft dark gradient overlays so text remains sharp & legible */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f19]/75 via-[#0b0f19]/45 to-[#0b0f19] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#0b0f19]/40 to-[#0b0f19] pointer-events-none" />
      </div>

      {/* Top Controls: Gemma 4 Badge & Interactive Preset Switcher */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-purple-500/30 text-purple-300 text-xs font-medium shadow-inner backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span>Powered by Google Gemma 4 & Official GenAI SDK</span>
        </div>

        {/* Fluid MicroSlats Preset Switcher */}
        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-[11px]">
          <span className="text-slate-400 px-2 font-mono">Fluid:</span>
          {PRESETS.map((p) => {
            const Icon = p.icon;
            const isActive = preset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPreset(p.id)}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full transition-all capitalize font-medium ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Title */}
      <div className="relative z-10">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15] drop-shadow-md">
          Understand Any GitHub Project <br className="hidden sm:block" />
          <span className="gradient-text">with AI for Beginners</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow">
          Turn complex repositories into simple, beginner-friendly explanations. 
          Inspect folder structure, file relationships, code flow, and ask questions with zero hallucinations.
        </p>
      </div>

      {/* Input Form */}
      <div className="mt-10 max-w-3xl mx-auto relative z-10">
        <form onSubmit={handleSubmit} className="relative group">
          <div className="relative flex items-center p-2 rounded-2xl glass-panel border border-white/15 shadow-2xl group-focus-within:border-purple-500/50 group-focus-within:ring-2 group-focus-within:ring-purple-500/20 transition-all">
            <div className="pl-3.5 pr-2 text-slate-400">
              <Search className="w-5 h-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste public GitHub repository URL (e.g. https://github.com/expressjs/express)"
              disabled={isLoading}
              className="w-full bg-transparent px-2 py-3 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm sm:text-base shadow-lg shadow-purple-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Analyze Repository</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Loading progress card */}
        {isLoading && (
          <div className="mt-6 p-4 rounded-xl glass-panel border border-purple-500/30 text-left animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-purple-300">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                {ANALYSIS_STAGES[stageIndex]}
              </div>
              <span className="text-xs text-slate-400">Step {stageIndex + 1} of {ANALYSIS_STAGES.length}</span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-indigo-400 h-2 transition-all duration-500 ease-out"
                style={{ width: `${((stageIndex + 1) / ANALYSIS_STAGES.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm text-left flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
            <div>
              <p className="font-semibold text-red-300">Analysis Error</p>
              <p className="text-red-200/90 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* 1-Click Demo Repositories */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span>Or try an instant demo repository:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {demoRepos.map((repo, i) => (
              <button
                key={i}
                onClick={() => onSelectDemo(repo.url)}
                disabled={isLoading}
                className="text-left p-3 rounded-xl glass-panel glass-panel-hover border border-white/5 flex flex-col justify-between group disabled:opacity-50"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
                      {repo.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                      {repo.language}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {repo.description}
                  </p>
                </div>
                <div className="mt-3 flex items-center text-[11px] text-purple-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Analyze Demo</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Value Props */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left relative z-10">
        <div className="p-6 rounded-2xl glass-panel border border-white/5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
            <Code className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-white">Deep AST & File Inspection</h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Not just a README summary. Analyzes directory structure, entrypoints, routes, dependencies, and configuration.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-white/5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
            <Layers className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-white">Visual Architecture & Flow</h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Visual component diagrams showing how client, API, server, and data layers connect with step-by-step code flow.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-white/5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-white">Grounded Beginner Q&A</h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Ask any question about the codebase. Answers use real repository evidence and refuse to hallucinate unprovided code.
          </p>
        </div>
      </div>
    </div>
  );
}
