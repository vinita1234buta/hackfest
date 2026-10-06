import React from 'react';
import { 
  Lightbulb, 
  Target, 
  Users, 
  Layers, 
  FileCheck, 
  Sparkles, 
  HelpCircle,
  Code2,
  CheckCircle2
} from 'lucide-react';

export default function OverviewTab({ result, onNavigateTab }) {
  const { overview, technologies, beginner_explanation } = result;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Beginner Analogy Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel border border-purple-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-300">
            <Lightbulb className="w-6 h-6 animate-pulse" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Beginner-Friendly Explanation
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                Analogy Mode
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {overview.quick_summary}
            </h2>

            <div className="text-slate-300 text-sm sm:text-base leading-relaxed space-y-2 whitespace-pre-line font-normal">
              {beginner_explanation}
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column: Problem Solved & Target Audience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Problem Solved */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base">What Problem It Solves</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            {overview.problem_solved}
          </p>
        </div>

        {/* Target Audience */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base">Who Uses This Project</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            {overview.target_audience}
          </p>
        </div>
      </div>

      {/* Technology Stack with Verified Evidence */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              Technology Stack
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Only detected technologies confirmed by repository manifest or code evidence
            </p>
          </div>
          <span className="text-xs font-mono text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full">
            {technologies.length} Verified Technologies
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {technologies.map((tech, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-xl glass-panel glass-panel-hover border border-white/5 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-white text-sm">
                    {tech.name}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-purple-300 border border-white/10 shrink-0">
                    {tech.category}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-start gap-1.5 text-xs text-slate-400">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="font-mono text-[11px] text-slate-300 break-all">
                  {tech.evidence}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Navigation Footer */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-900/20 via-indigo-900/20 to-blue-900/20 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          <p className="text-xs text-slate-300">
            Ready to explore further? Check out the visual architecture diagram or browse files.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('architecture')}
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors"
          >
            View Architecture →
          </button>
          <button
            onClick={() => onNavigateTab('explorer')}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium transition-colors"
          >
            Open File Explorer →
          </button>
        </div>
      </div>
    </div>
  );
}
