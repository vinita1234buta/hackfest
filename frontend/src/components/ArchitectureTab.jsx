import React, { useState } from 'react';
import { 
  Layers, 
  Workflow, 
  ArrowRight, 
  ArrowDown, 
  Info, 
  ShieldAlert, 
  CheckCircle, 
  Globe, 
  Server, 
  Database, 
  Cpu, 
  Settings, 
  Box,
  FileCode
} from 'lucide-react';

const TYPE_ICONS = {
  frontend: Globe,
  backend: Server,
  database: Database,
  api: Cpu,
  service: Box,
  config: Settings,
  external: Globe,
};

const TYPE_COLORS = {
  frontend: 'from-blue-500/20 to-cyan-500/20 border-cyan-500/40 text-cyan-300',
  backend: 'from-purple-500/20 to-indigo-500/20 border-purple-500/40 text-purple-300',
  database: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300',
  api: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300',
  service: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/40 text-indigo-300',
  config: 'from-slate-500/20 to-zinc-500/20 border-slate-500/40 text-slate-300',
  external: 'from-pink-500/20 to-rose-500/20 border-rose-500/40 text-rose-300',
};

export default function ArchitectureTab({ result, onSelectFile }) {
  const { architecture, main_flow } = result;
  const [selectedComponentId, setSelectedComponentId] = useState(
    architecture?.components?.[0]?.id || null
  );

  const selectedComp = architecture?.components?.find((c) => c.id === selectedComponentId);

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* High Level Architecture Overview */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              Architecture Visualization
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Structural component model inferred from codebase structure and dependency graphs
            </p>
          </div>

          <div className="flex items-center gap-2">
            {architecture.is_inferred ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                <Info className="w-3.5 h-3.5" />
                Inferred from Repository Evidence
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                <CheckCircle className="w-3.5 h-3.5" />
                Documented Architecture
              </span>
            )}
          </div>
        </div>

        {/* Architecture Summary Callout */}
        <div className="p-5 rounded-xl glass-panel border border-white/10 space-y-2">
          <div className="text-sm font-semibold text-white">
            Pattern: <span className="text-purple-300">{architecture.summary}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            {architecture.explanation}
          </p>
        </div>

        {/* Visual Component Flow Canvas */}
        {architecture.components && architecture.components.length > 0 ? (
          <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-white/10 bg-[#090d16]/90 relative overflow-hidden">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-6 flex items-center justify-between">
              <span>Interactive Component Graph (Click any component to inspect)</span>
              <span className="text-[11px] text-purple-400">Flow Direction: Left to Right / Top to Down</span>
            </div>

            {/* Nodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {architecture.components.map((comp, idx) => {
                const IconComponent = TYPE_ICONS[comp.type] || Box;
                const colorStyle = TYPE_COLORS[comp.type] || TYPE_COLORS.service;
                const isSelected = comp.id === selectedComponentId;

                return (
                  <div key={comp.id} className="flex flex-col items-center">
                    <button
                      onClick={() => setSelectedComponentId(comp.id)}
                      className={`w-full text-left p-5 rounded-2xl bg-gradient-to-b ${colorStyle} border transition-all duration-300 shadow-xl relative ${
                        isSelected 
                          ? 'ring-2 ring-purple-400 scale-[1.02] shadow-purple-500/20' 
                          : 'hover:scale-[1.01] hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-white">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/30 border border-white/10 text-white">
                          {comp.type}
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-base tracking-tight">
                        {comp.name}
                      </h4>
                      <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                        {comp.description}
                      </p>

                      {comp.files && comp.files.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-1.5 text-[11px] text-slate-300 font-mono">
                          <FileCode className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                          <span className="truncate">{comp.files.length} related files</span>
                        </div>
                      )}
                    </button>

                    {/* Flow arrow to next node if not last on small screens */}
                    {idx < architecture.components.length - 1 && (
                      <div className="my-2 md:hidden text-purple-400">
                        <ArrowDown className="w-5 h-5 animate-bounce" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected Component Inspection Panel */}
            {selectedComp && (
              <div className="mt-8 p-5 rounded-xl bg-white/[0.03] border border-white/10 animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                      Component Details:
                    </span>
                    <span className="text-sm font-semibold text-white">{selectedComp.name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">ID: {selectedComp.id}</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal mb-4">
                  {selectedComp.description}
                </p>

                {selectedComp.files && selectedComp.files.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Implementing Source Files:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedComp.files.map((file, fi) => (
                        <button
                          key={fi}
                          onClick={() => onSelectFile(file)}
                          className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-purple-200 border border-white/10 transition-colors"
                        >
                          <FileCode className="w-3.5 h-3.5 text-purple-400" />
                          <span>{file}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 rounded-xl glass-panel border border-white/10 text-center text-slate-400">
            <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-sm">Architecture could not be fully determined from the available repository files.</p>
          </div>
        )}
      </div>

      {/* Main Execution / Code Flow Section */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Workflow className="w-5 h-5 text-indigo-400" />
            Main Code Flow & Execution Path
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Step-by-step walkthrough of how data moves from user interaction to program execution
          </p>
        </div>

        <div className="space-y-4">
          {main_flow.map((flowStep, idx) => (
            <div 
              key={idx}
              className="p-5 rounded-xl glass-panel border border-white/5 hover:border-purple-500/30 transition-all flex flex-col md:flex-row md:items-start gap-4"
            >
              {/* Step Badge */}
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                {flowStep.step}
              </div>

              {/* Step Content */}
              <div className="space-y-2 flex-1">
                <h4 className="font-semibold text-white text-base">
                  {flowStep.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {flowStep.description}
                </p>

                {flowStep.files_involved && flowStep.files_involved.length > 0 && (
                  <div className="pt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                      Files Involved:
                    </span>
                    {flowStep.files_involved.map((file, fi) => (
                      <button
                        key={fi}
                        onClick={() => onSelectFile(file)}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-purple-200 border border-white/10 transition-colors"
                      >
                        {file}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
