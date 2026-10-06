import React, { useState } from 'react';
import { 
  PlayCircle, 
  Terminal, 
  Copy, 
  Check, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

export default function HowToRunTab({ result }) {
  const { run_instructions, repo_info } = result;
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (command, idx) => {
    navigator.clipboard.writeText(command);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Evidence Guardrail Banner */}
      <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-3 text-purple-200 text-xs sm:text-sm">
        <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Repository-Grounded Instructions: </span>
          All execution steps below are strictly extracted from this repository's configuration files (e.g. package manifests, Makefile, or README). Commands are never fabricated.
        </div>
      </div>

      {/* Instructions Sequence */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-emerald-400" />
            Execution Guide
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Follow these commands in your terminal to set up and run {repo_info.name} locally
          </p>
        </div>

        {run_instructions && run_instructions.length > 0 ? (
          <div className="space-y-4">
            {/* Step 0: Clone Repository */}
            <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white font-mono font-bold text-xs flex items-center justify-center">
                    1
                  </div>
                  <h4 className="font-bold text-white text-sm">
                    Clone the Repository
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                  Standard Git Workflow
                </span>
              </div>

              <div className="relative group">
                <pre className="p-3.5 rounded-xl bg-[#090d16] border border-white/10 text-xs font-mono text-emerald-400 overflow-x-auto flex items-center justify-between">
                  <code>git clone {repo_info.url}.git</code>
                  <button
                    onClick={() => handleCopy(`git clone ${repo_info.url}.git`, 'clone')}
                    className="ml-3 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0"
                    title="Copy command"
                  >
                    {copiedIndex === 'clone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </pre>
              </div>
            </div>

            {/* Extracted Repo Steps */}
            {run_instructions.map((step, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-2xl glass-panel border border-white/10 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono font-bold text-xs flex items-center justify-center">
                      {idx + 2}
                    </div>
                    <h4 className="font-bold text-white text-sm">
                      {step.title}
                    </h4>
                  </div>

                  {step.source_file && (
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Source: {step.source_file}</span>
                    </div>
                  )}
                </div>

                {step.prerequisites && (
                  <div className="text-xs text-slate-300 bg-white/[0.02] p-2.5 rounded-lg border border-white/5 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Prerequisite: {step.prerequisites}</span>
                  </div>
                )}

                {step.command && (
                  <div className="relative group">
                    <pre className="p-3.5 rounded-xl bg-[#090d16] border border-white/10 text-xs font-mono text-purple-300 overflow-x-auto flex items-center justify-between">
                      <code>{step.command}</code>
                      <button
                        onClick={() => handleCopy(step.command, idx)}
                        className="ml-3 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0"
                        title="Copy command"
                      >
                        {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl glass-panel border border-white/10 text-center text-slate-400 space-y-2">
            <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto" />
            <p className="text-sm font-medium text-white">No explicit run instructions detected in repository files.</p>
            <p className="text-xs">Check the project README or open an issue on the repository.</p>
          </div>
        )}
      </div>
    </div>
  );
}
